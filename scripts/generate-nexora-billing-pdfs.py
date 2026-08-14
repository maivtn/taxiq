#!/usr/bin/env python3
"""Generate NEXORA invoice and receipt PDFs from the shared browser fixture."""

from __future__ import annotations

import json
import re
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "html/assets/nexora-package-billing-data.js"
PAGES_DIR = ROOT / "html/pages"
LOGO_PATH = PAGES_DIR / "assets/icon-nexora.png"

TEXT = HexColor("#000000")
MUTED = HexColor("#000000")
SUBTLE = HexColor("#000000")
BORDER = HexColor("#E5EAF2")
SURFACE = HexColor("#F7F9FC")

PAGE_HORIZONTAL_MARGIN = 0.58 * inch
FRAME_HORIZONTAL_PADDING = 6
CONTENT_LEFT = PAGE_HORIZONTAL_MARGIN + FRAME_HORIZONTAL_PADDING
CONTENT_WIDTH = A4[0] - (2 * CONTENT_LEFT)
HEADER_LOGO_SIZE = 0.38 * inch


def load_records() -> list[dict[str, Any]]:
    source = DATA_PATH.read_text(encoding="utf-8")
    match = re.search(r"const records = (\[.*?\]);", source, re.DOTALL)
    if not match:
        raise ValueError(f"Could not find the records JSON literal in {DATA_PATH}")
    records = json.loads(match.group(1))
    for record in records:
        expected_total = round(float(record["subtotal"]) + float(record["taxAmount"]), 2)
        if expected_total != round(float(record["total"]), 2):
            raise ValueError(f"Totals do not balance for {record['transactionId']}")
        if record["paymentStatus"] == "paid" and not record.get("receiptFile"):
            raise ValueError(f"Paid record is missing receiptFile: {record['transactionId']}")
        if record["paymentStatus"] != "paid" and record.get("receiptFile"):
            raise ValueError(f"Unpaid record must not expose receiptFile: {record['transactionId']}")
    return records


def parse_date(value: str) -> datetime:
    return datetime.fromisoformat(value)


def format_date(value: str) -> str:
    parsed = parse_date(value)
    return f"{parsed.strftime('%B')} {parsed.day}, {parsed.year}"


def format_money(value: float, currency: str = "USD") -> str:
    amount = f"${float(value):,.2f}"
    return f"{amount} {currency}" if currency != "USD" else amount


def xml(value: Any) -> str:
    return escape(str(value))


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=TEXT,
            spaceAfter=5,
        ),
        "meta": ParagraphStyle(
            "Meta",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=MUTED,
        ),
        "meta_right": ParagraphStyle(
            "MetaRight",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=MUTED,
            alignment=TA_RIGHT,
        ),
        "label": ParagraphStyle(
            "Label",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=11,
            textColor=SUBTLE,
            uppercase=True,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=TEXT,
        ),
        "body_right": ParagraphStyle(
            "BodyRight",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=TEXT,
            alignment=TA_RIGHT,
        ),
        "body_bold": ParagraphStyle(
            "BodyBold",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=13,
            textColor=TEXT,
        ),
        "amount": ParagraphStyle(
            "Amount",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            textColor=TEXT,
        ),
        "section": ParagraphStyle(
            "Section",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=TEXT,
            spaceAfter=8,
        ),
    }


def footer(canvas: Any, document: Any) -> None:
    canvas.saveState()
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(CONTENT_LEFT, 0.52 * inch, A4[0] - CONTENT_LEFT, 0.52 * inch)
    canvas.setFillColor(SUBTLE)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(CONTENT_LEFT, 0.34 * inch, "NEXORA TOUCH billing document")
    canvas.drawRightString(A4[0] - CONTENT_LEFT, 0.34 * inch, f"Page {canvas.getPageNumber()}")
    canvas.restoreState()


def header_block(record: dict[str, Any], document_type: str, style: dict[str, ParagraphStyle]) -> list[Any]:
    logo = Image(str(LOGO_PATH), width=HEADER_LOGO_SIZE, height=HEADER_LOGO_SIZE)
    logo.hAlign = "RIGHT"
    title_row = Table(
        [[Paragraph(document_type, style["title"]), logo]],
        colWidths=[CONTENT_WIDTH - HEADER_LOGO_SIZE, HEADER_LOGO_SIZE],
    )
    title_row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))

    meta_lines = [f"Invoice number  <b>{xml(record['invoiceNumber'])}</b>"]
    if document_type == "Receipt":
        meta_lines.append(f"Receipt number  <b>{xml(record['receiptNumber'])}</b>")
        meta_lines.append(f"Date paid  <b>{format_date(record['datePaid'])}</b>")
    else:
        meta_lines.append(f"Date of issue  <b>{format_date(record['dateIssued'])}</b>")
        meta_lines.append(f"Date due  <b>{format_date(record['dateDue'])}</b>")

    return [
        title_row,
        Spacer(1, 0.18 * inch),
        Paragraph("<br/>".join(meta_lines), style["meta"]),
        Spacer(1, 0.22 * inch),
    ]


def parties_block(record: dict[str, Any], style: dict[str, ParagraphStyle]) -> Table:
    seller = record["seller"]
    bill_to = record["billTo"]
    seller_address = "<br/>".join(xml(line) for line in seller.get("addressLines", []))
    bill_to_address = "<br/>".join(xml(line) for line in bill_to.get("addressLines", []))
    seller_legal_name = seller.get("legalName", seller["name"])
    data = [[
        Paragraph(
            f"<b>Seller</b><br/><b>{xml(seller_legal_name)}</b><br/>{seller_address}<br/>"
            f"<font color='#000000'>{xml(seller['email'])}</font>",
            style["body"],
        ),
        Paragraph(
            f"<b>Bill to</b><br/><b>{xml(bill_to['name'])}</b><br/>{bill_to_address}<br/>"
            f"<font color='#000000'>{xml(bill_to['email'])}</font>",
            style["body"],
        ),
    ]]
    table = Table(data, colWidths=[CONTENT_WIDTH / 2, CONTENT_WIDTH / 2])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return table


def amount_block(record: dict[str, Any], document_type: str, style: dict[str, ParagraphStyle]) -> Table:
    paid = document_type == "Receipt"
    headline = "Amount paid" if paid else "Amount due"
    date_copy = f"Paid {format_date(record['datePaid'])}" if paid else f"Due {format_date(record['dateDue'])}"
    table = Table([
        [Paragraph(headline, style["meta"])],
        [Paragraph(format_money(record["total"], record["currency"]), style["amount"])],
        [Paragraph(date_copy, style["meta"])],
    ], colWidths=[CONTENT_WIDTH], cornerRadii=[9, 9, 9, 9])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
        ("BOX", (0, 0), (-1, -1), 0.7, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (0, 0), 12),
        ("BOTTOMPADDING", (0, 0), (0, 0), 2),
        ("TOPPADDING", (0, 1), (0, 1), 0),
        ("BOTTOMPADDING", (0, 1), (0, 1), 3),
        ("TOPPADDING", (0, 2), (0, 2), 0),
        ("BOTTOMPADDING", (0, 2), (0, 2), 12),
    ]))
    return table


def line_items_table(record: dict[str, Any], style: dict[str, ParagraphStyle]) -> Table:
    rows: list[list[Any]] = [[
        Paragraph("Description", style["label"]),
        Paragraph("Qty", style["label"]),
        Paragraph("Unit price", style["label"]),
        Paragraph("Tax", style["label"]),
        Paragraph("Amount", style["label"]),
    ]]
    for item in record["lineItems"]:
        period = item.get("period")
        description = Paragraph(
            f"<b>{xml(item['description'])}</b>"
            + (f"<br/><font color='#000000'>{xml(period)}</font>" if period else ""),
            style["body"],
        )
        tax = f"{float(record['taxRate']):g}%"
        rows.append([
            description,
            Paragraph(str(item["quantity"]), style["body_right"]),
            Paragraph(format_money(item["unitPrice"], record["currency"]), style["body_right"]),
            Paragraph(tax, style["body_right"]),
            Paragraph(f"<b>{format_money(item['amount'], record['currency'])}</b>", style["body_right"]),
        ])
    base_width = 6.7 * inch
    table = Table(
        rows,
        colWidths=[CONTENT_WIDTH * width / base_width for width in (2.8 * inch, 0.52 * inch, 1.12 * inch, 0.84 * inch, 1.42 * inch)],
        repeatRows=1,
    )
    table.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, TEXT),
        ("LINEBELOW", (0, 1), (-1, -1), 0.5, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
        ("RIGHTPADDING", (-1, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, 0), 7),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 7),
        ("TOPPADDING", (0, 1), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 10),
    ]))
    return table


def totals_table(record: dict[str, Any], document_type: str, style: dict[str, ParagraphStyle]) -> Table:
    final_label = "Amount paid" if document_type == "Receipt" else "Amount due"
    rows = [
        [Paragraph("Subtotal", style["body"]), Paragraph(format_money(record["subtotal"], record["currency"]), style["body_right"])],
        [Paragraph("Total excluding tax", style["body"]), Paragraph(format_money(record["subtotal"], record["currency"]), style["body_right"])],
        [Paragraph(f"{xml(record['taxLabel'])} ({float(record['taxRate']):g}%)", style["meta"]), Paragraph(format_money(record["taxAmount"], record["currency"]), style["meta_right"])],
        [Paragraph("Total", style["body_bold"]), Paragraph(f"<b>{format_money(record['total'], record['currency'])}</b>", style["body_right"])],
        [Paragraph(f"<b>{final_label}</b>", style["body_bold"]), Paragraph(f"<b>{format_money(record['total'], record['currency'])}</b>", style["body_right"])],
    ]
    table = Table(rows, colWidths=[2.15 * inch, 1.55 * inch], hAlign="RIGHT")
    table.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, -1), 0.45, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
        ("RIGHTPADDING", (-1, 0), (-1, -1), 0),
        ("TOPPADDING", (0, -1), (-1, -1), 8),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 8),
        ("BACKGROUND", (0, -1), (-1, -1), SURFACE),
    ]))
    return table


def payment_history(record: dict[str, Any], style: dict[str, ParagraphStyle]) -> list[Any]:
    method = record["paymentMethod"]
    rows = [[
        Paragraph("Payment method", style["label"]),
        Paragraph("Date", style["label"]),
        Paragraph("Amount paid", style["label"]),
        Paragraph("Receipt number", style["label"]),
    ], [
        Paragraph(f"{xml(method['brand'])} - {xml(method['last4'])}", style["body"]),
        Paragraph(format_date(record["datePaid"]), style["body"]),
        Paragraph(format_money(record["total"], record["currency"]), style["body_right"]),
        Paragraph(xml(record["receiptNumber"]), style["body_right"]),
    ]]
    base_width = 6.7 * inch
    table = Table(
        rows,
        colWidths=[CONTENT_WIDTH * width / base_width for width in (1.75 * inch, 1.65 * inch, 1.45 * inch, 1.85 * inch)],
    )
    table.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, TEXT),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
        ("RIGHTPADDING", (-1, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return [Spacer(1, 0.2 * inch), Paragraph("Payment history", style["section"]), table]


def build_document(record: dict[str, Any], output_path: Path, document_type: str) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    style = styles()
    document = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=PAGE_HORIZONTAL_MARGIN,
        rightMargin=PAGE_HORIZONTAL_MARGIN,
        topMargin=0.5 * inch,
        bottomMargin=0.68 * inch,
        title=f"{document_type} {record['invoiceNumber']}",
        author="NEXORA TOUCH",
        subject="Package billing document",
    )
    story: list[Any] = []
    story.extend(header_block(record, document_type, style))
    story.append(parties_block(record, style))
    story.append(Spacer(1, 0.22 * inch))
    story.append(amount_block(record, document_type, style))
    story.append(Spacer(1, 0.25 * inch))
    story.append(line_items_table(record, style))
    story.append(Spacer(1, 0.12 * inch))
    story.append(totals_table(record, document_type, style))
    if document_type == "Receipt":
        story.extend(payment_history(record, style))
    document.build(story, onFirstPage=footer, onLaterPages=footer)


def build_invoice(record: dict[str, Any], output_path: Path) -> None:
    build_document(record, output_path, "Invoice")


def build_receipt(record: dict[str, Any], output_path: Path) -> None:
    build_document(record, output_path, "Receipt")


def main() -> None:
    records = load_records()
    generated: list[Path] = []
    for record in records:
        invoice_path = PAGES_DIR / record["invoiceFile"]
        build_invoice(record, invoice_path)
        generated.append(invoice_path)
        if record["paymentStatus"] == "paid":
            receipt_path = PAGES_DIR / record["receiptFile"]
            build_receipt(record, receipt_path)
            generated.append(receipt_path)
    for path in generated:
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
