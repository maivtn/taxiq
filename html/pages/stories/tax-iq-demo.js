(function () {
  const checkIdsByKind = {
    expense: ['business-purpose', 'personal-share', 'source-record'],
    income: ['income-source', 'payment-record', 'professional-review']
  };

  const copy = {
    en: {
      missingReceipt: 'No receipt selected',
      error: 'Please check the description and amount.',
      checks: {
        'business-purpose': 'What work was this cost for? Was it ordinary and necessary for your business?',
        'personal-share': 'Was any part for personal use? Separate and document the business portion.',
        'source-record': 'Can you match the cost to the original receipt, payment and date?',
        'income-source': 'Where did this payment come from, and when was it received?',
        'payment-record': 'Can you match the amount to your payment or sales record?',
        'professional-review': 'What would you like an accountant or tax professional to confirm?'
      }
    },
    vi: {
      missingReceipt: 'Chưa chọn biên lai',
      error: 'Vui lòng kiểm tra mô tả và số tiền.',
      checks: {
        'business-purpose': 'Khoản chi phục vụ công việc gì? Nó có thông thường và cần thiết cho hoạt động kinh doanh không?',
        'personal-share': 'Có phần nào dùng cho cá nhân không? Tách và ghi lại phần phục vụ công việc.',
        'source-record': 'Có đối chiếu được với biên lai gốc, thanh toán và ngày chi không?',
        'income-source': 'Khoản tiền đến từ đâu và được nhận vào ngày nào?',
        'payment-record': 'Có đối chiếu được số tiền với hồ sơ thanh toán hoặc bán hàng không?',
        'professional-review': 'Bạn muốn kế toán hoặc chuyên gia thuế xác nhận điều gì?'
      }
    }
  };

  function buildReview(input) {
    const kind = input.kind;
    if (!checkIdsByKind[kind]) throw new Error('Invalid record kind');
    const description = String(input.description || '').trim();
    if (!description) throw new Error('Description required');
    const rawAmount = String(input.amount || '').trim();
    const number = rawAmount ? Number(rawAmount) : null;
    if (rawAmount && (!Number.isFinite(number) || number < 0)) throw new Error('Invalid amount');
    return {
      kind,
      description,
      amount: number === null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number),
      receiptName: String(input.receiptName || '').trim(),
      checkIds: checkIdsByKind[kind]
    };
  }

  if (typeof module !== 'undefined') module.exports = { buildReview };
  if (typeof document === 'undefined') return;

  document.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('[data-tax-demo]');
    if (!root) return;
    const lang = document.documentElement.lang === 'vi' ? 'vi' : 'en';
    const words = copy[lang];
    const form = root.querySelector('form');
    const kind = form.querySelector('[name="record-kind"]');
    const description = form.querySelector('[name="record-description"]');
    const amount = form.querySelector('[name="record-amount"]');
    const receipt = form.querySelector('[name="record-receipt"]');
    const result = root.querySelector('[data-demo-result]');
    const resultDescription = result.querySelector('[data-result-description]');
    const resultAmount = result.querySelector('[data-result-amount]');
    const resultReceipt = result.querySelector('[data-result-receipt]');
    const resultChecks = result.querySelector('[data-result-checks]');
    const error = root.querySelector('[data-demo-error]');

    function showReview() {
      try {
        const review = buildReview({
          kind: kind.value,
          description: description.value,
          amount: amount.value,
          receiptName: receipt.files && receipt.files[0] ? receipt.files[0].name : ''
        });
        resultDescription.textContent = review.description;
        resultAmount.textContent = review.amount;
        resultReceipt.textContent = review.receiptName || words.missingReceipt;
        resultChecks.replaceChildren(...review.checkIds.map(function (id) {
          const item = document.createElement('li');
          item.textContent = words.checks[id];
          return item;
        }));
        error.hidden = true;
        result.hidden = false;
      } catch (_error) {
        error.textContent = words.error;
        error.hidden = false;
        result.hidden = true;
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      showReview();
    });
    root.querySelector('[data-demo-sample]').addEventListener('click', function () {
      kind.value = 'expense';
      description.value = lang === 'vi' ? 'Vật tư dùng phục vụ khách' : 'Supplies used for a client service';
      amount.value = '24.50';
      receipt.value = '';
      showReview();
    });
    root.querySelector('[data-demo-clear]').addEventListener('click', function () {
      form.reset();
      result.hidden = true;
      error.hidden = true;
    });
  });
})();
