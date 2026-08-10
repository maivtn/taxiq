import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  computed,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { appRoutes } from '@lib/utils';
import { PrivacyPolicyDialogComponent } from '@pages/homepage/components/footer/privacy-policy-dialog/privacy-policy-dialog.component';
import { NEWS_LIBRARY_FILE } from '@shared/utils/constants/help-center';
import { catchError, distinctUntilChanged, map, Observable, of, startWith, switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { ChannelVideo, NewsLibraryContent, NewsTab } from './news-library.types';

@Component({
  selector: 'app-news-library',
  standalone: true,
  imports: [TranslocoModule, CommonModule, MatTabsModule],
  templateUrl: './news-library.component.html',
  styleUrl: './news-library.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsLibraryComponent implements OnInit {
  readonly #translocoService = inject(TranslocoService);
  readonly activeTab = signal<NewsTab>('news');
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly showAllChannelVideos = signal(false);
  readonly currentLang = signal(this.#translocoService.getActiveLang());
  readonly mediaActionLabels = computed(() => {
    this.currentLang();
    return {
      pdf: this.#translocoService.translate('sitebar.news-library.subMenu.open-pdf'),
      video: this.#translocoService.translate('sitebar.news-library.subMenu.watch-on-youtube'),
    };
  });

  readonly content = signal<Required<NewsLibraryContent>>({
    featuredVideos: [],
    channelVideos: [],
    planTopics: [],
    morePlanVideos: [],
    featuredContent: null,
    solutionPresentations: [],
    trainingVideos: [],
    upcomingSessions: [],
    upcomingEvents: [],
    recentSessions: [],
    videoZoomHistory: [],
  });

  readonly tabs: Array<{ id: NewsTab; labelKey: string }> = [
    { id: 'news', labelKey: 'news' },
    { id: 'events', labelKey: 'event-zoom' },
    { id: 'plan', labelKey: 'compensation-plan' },
    { id: 'content', labelKey: 'presentation-video' },
  ];

  readonly #destroyRef = inject(DestroyRef);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #dialog = inject(MatDialog);

  get activeTabIndex(): number {
    const activeIndex = this.tabs.findIndex((tab) => tab.id === this.activeTab());
    return activeIndex >= 0 ? activeIndex : 0;
  }

  ngOnInit(): void {
    this.#route.paramMap
      .pipe(
        map((params) => params.get('tab')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe((requestedTab) => {
        const resolvedTab = this.resolveTab(requestedTab);

        if (requestedTab !== resolvedTab) {
          void this.#router.navigateByUrl(this.getTabRoute(resolvedTab), { replaceUrl: true });
          return;
        }

        this.activeTab.set(resolvedTab);
      });

    this.#translocoService.langChanges$
      .pipe(
        startWith(this.#translocoService.getActiveLang()),
        switchMap((lang) => {
          this.currentLang.set(lang);
          this.isLoading.set(true);
          this.hasError.set(false);
          this.showAllChannelVideos.set(false);
          return this.loadNewsLibraryContent(lang);
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe((content) => {
        this.content.set(content);
        this.isLoading.set(false);
      });
  }

  setActiveTab(tab: NewsTab): void {
    if (this.activeTab() === tab && this.#route.snapshot.paramMap.get('tab') === tab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    void this.#router.navigateByUrl(this.getTabRoute(tab));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onTabChange(index: number): void {
    const selectedTab = this.tabs[index]?.id;

    if (!selectedTab) {
      return;
    }

    this.setActiveTab(selectedTab);
  }

  showMoreChannelVideos(): void {
    this.showAllChannelVideos.set(true);
  }

  visibleChannelVideos(): ChannelVideo[] {
    const channelVideos = this.content().channelVideos;
    return this.showAllChannelVideos() ? channelVideos : channelVideos.filter((item) => !item.isExtra);
  }

  hasExtraChannelVideos(): boolean {
    return this.content().channelVideos.some((item) => item.isExtra);
  }

  trackByUrl(_: number, item: { url: string }): string {
    return item.url;
  }

  trackByValue(_: number, item: string): string {
    return item;
  }

  trackByTitle(_: number, item: { title: string }): string {
    return item.title;
  }

  onBack() {
    window.history.back();
  }

  openMedia(event: Event, url: string, title: string): void {
    const youtubeEmbedUrl = this.toYoutubeEmbedUrl(url);

    if (youtubeEmbedUrl) {
      event.preventDefault();
      event.stopPropagation();
      void Swal.fire({
        title: this.escapeHtml(title),
        html: `
        <div class="news-library-swal-frame">
          <iframe
            src="${youtubeEmbedUrl}"
            title="${this.escapeHtml(title)}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      `,
        width: 960,
        showConfirmButton: false,
        showCloseButton: true,
        padding: '1rem',
        customClass: {
          popup: 'news-library-swal-popup news-library-swal-popup-video',
          closeButton: 'news-library-swal-close',
          title: 'news-library-swal-title',
          htmlContainer: 'news-library-swal-html',
        },
      });
      return;
    }

    if (this.isPdfUrl(url)) {
      event.preventDefault();
      event.stopPropagation();
      this.#dialog.open(PrivacyPolicyDialogComponent, {
        data: url,
      });
      return;
    }

    const safeUrl = this.getSafeExternalUrl(url);
    if (!safeUrl) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.isDownloadableFileUrl(safeUrl)) {
      this.downloadFile(safeUrl);
      return;
    }

    window.open(safeUrl, '_blank', 'noopener,noreferrer');
  }

  openHtmlContent(title: string, htmlContent?: string): void {
    if (!htmlContent) {
      return;
    }

    void Swal.fire({
      title,
      html: `<div class="news-library-swal-content">${htmlContent}</div>`,
      width: 860,
      showConfirmButton: false,
      customClass: {
        popup: 'news-library-swal-popup news-library-swal-popup-content',
        closeButton: 'news-library-swal-close',
        title: 'news-library-swal-title',
        htmlContainer: 'news-library-swal-html news-library-swal-html-content',
        confirmButton: 'news-library-swal-confirm',
      },
      showCloseButton: true,
    });
  }

  openPresentationPopup(event: Event, url: string, title: string): void {
    this.openMedia(event, url, title);
  }

  getMediaActionLabel(url: string): string {
    return this.isPdfUrl(url) ? this.mediaActionLabels().pdf : this.mediaActionLabels().video;
  }

  getMediaActionIcon(url: string): string {
    return this.isPdfUrl(url) ? 'far fa-file-pdf' : 'fas fa-play';
  }

  getZoomHistoryIcon(url: string): string {
    if (this.isPdfUrl(url)) return 'far fa-file-pdf';
    if (this.isDownloadableFileUrl(url)) return 'fas fa-file';
    return 'fas fa-video';
  }

  openExternalLink(url?: string): void {
    const safeUrl = this.getSafeExternalUrl(url);
    if (!safeUrl) {
      return;
    }
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
  }
  private getSafeExternalUrl(url?: string): string | null {
    if (!url?.trim()) {
      return null;
    }
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return null;
      }
      return parsedUrl.toString();
    } catch {
      return null;
    }
  }

  private loadNewsLibraryContent(lang: string) {
    const normalizedLang = lang === 'vi' ? 'vi' : 'en';
    const primaryUrl = normalizedLang === 'vi' ? NEWS_LIBRARY_FILE.NEWS_LIBRARY_VI : NEWS_LIBRARY_FILE.NEWS_LIBRARY_EN;

    return this.fetchNewsLibraryContent(primaryUrl).pipe(
      map((content) => this.normalizeContent(content)),
      catchError(() => {
        if (primaryUrl === NEWS_LIBRARY_FILE.NEWS_LIBRARY_EN) {
          this.hasError.set(true);
          return of(this.normalizeContent({}));
        }

        return this.fetchNewsLibraryContent(NEWS_LIBRARY_FILE.NEWS_LIBRARY_EN).pipe(
          map((content) => this.normalizeContent(content)),
          catchError(() => {
            this.hasError.set(true);
            return of(this.normalizeContent({}));
          }),
        );
      }),
    );
  }

  private fetchNewsLibraryContent(url: string): Observable<NewsLibraryContent> {
    return new Observable<NewsLibraryContent>((subscriber) => {
      const controller = new AbortController();

      fetch(url, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch news library content: ${response.status}`);
          }

          return response.json() as Promise<NewsLibraryContent>;
        })
        .then((content) => {
          if (subscriber.closed) {
            return;
          }

          subscriber.next(content);
          subscriber.complete();
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }

          subscriber.error(error);
        });

      return () => controller.abort();
    });
  }

  private normalizeContent(content: NewsLibraryContent): Required<NewsLibraryContent> {
    return {
      featuredVideos: content.featuredVideos ?? [],
      channelVideos: content.channelVideos ?? [],
      planTopics: content.planTopics ?? [],
      morePlanVideos: content.morePlanVideos ?? [],
      featuredContent: content.featuredContent ?? null,
      solutionPresentations: content.solutionPresentations ?? [],
      trainingVideos: content.trainingVideos ?? [],
      upcomingSessions: content.upcomingSessions ?? [],
      upcomingEvents: content.upcomingEvents ?? [],
      recentSessions: content.recentSessions ?? [],
      videoZoomHistory: content.videoZoomHistory ?? [],
    };
  }

  private toYoutubeEmbedUrl(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      const host = parsedUrl.hostname.replace('www.', '');

      if (host === 'youtu.be') {
        const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
      }

      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (parsedUrl.pathname === '/watch') {
          const videoId = parsedUrl.searchParams.get('v');
          return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
        }

        if (parsedUrl.pathname.startsWith('/embed/')) {
          const videoId = parsedUrl.pathname.split('/embed/')[1]?.split('/')[0];
          return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
        }

        if (parsedUrl.pathname.startsWith('/shorts/')) {
          const videoId = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0];
          return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  private isPdfUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname.toLowerCase();
      return pathname.endsWith('.pdf');
    } catch {
      return url.toLowerCase().includes('.pdf');
    }
  }

  private isDownloadableFileUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname.toLowerCase();
      return /\.(pptx|ppt|docx|doc|xlsx|xls|csv|txt|rtf|zip|rar|7z|odt|ods|odp|mp4|mov|avi|wmv|mkv)$/i.test(pathname);
    } catch {
      return /\.(pptx|ppt|docx|doc|xlsx|xls|csv|txt|rtf|zip|rar|7z|odt|ods|odp|mp4|mov|avi|wmv|mkv)(\?.*)?$/i.test(url);
    }
  }

  private downloadFile(url: string): void {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.download = '';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  private resolveTab(tab: string | null): NewsTab {
    return this.tabs.some((item) => item.id === tab) ? (tab as NewsTab) : 'news';
  }

  private getTabRoute(tab: NewsTab): string {
    switch (tab) {
      case 'plan':
        return appRoutes.newsLibrary.plan;
      case 'content':
        return appRoutes.newsLibrary.content;
      case 'events':
        return appRoutes.newsLibrary.events;
      case 'news':
      default:
        return appRoutes.newsLibrary.news;
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
