#!/usr/bin/env python3
"""Build the Shaw Stonework workers' comp decision guide PDF.

Run:  python3 build_workers_comp_guide.py
Output: workers-comp-guide.pdf (same folder)
"""

import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

NAVY = colors.HexColor("#1B3A5C")
GOLD = colors.HexColor("#C9971C")
LIGHT_BLUE = colors.HexColor("#EEF4FA")
LIGHT_GOLD = colors.HexColor("#FBF3DF")
GRAY = colors.HexColor("#555555")

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "workers-comp-guide.pdf")

styles = {
    "title": ParagraphStyle(
        "title", fontName="Helvetica-Bold", fontSize=20, leading=24,
        textColor=NAVY, alignment=TA_CENTER, spaceAfter=2,
    ),
    "subtitle": ParagraphStyle(
        "subtitle", fontName="Helvetica", fontSize=13, leading=17,
        textColor=GRAY, alignment=TA_CENTER,
    ),
    "h2": ParagraphStyle(
        "h2", fontName="Helvetica-Bold", fontSize=14, leading=18,
        textColor=NAVY, spaceBefore=10, spaceAfter=5,
    ),
    "step": ParagraphStyle(
        "step", fontName="Helvetica-Bold", fontSize=14, leading=18,
        textColor=colors.white,
    ),
    "body": ParagraphStyle(
        "body", fontName="Helvetica", fontSize=11, leading=15.5,
        textColor=colors.black, spaceAfter=6,
    ),
    "bullet": ParagraphStyle(
        "bullet", fontName="Helvetica", fontSize=11, leading=15.5,
        textColor=colors.black, leftIndent=16, bulletIndent=4, spaceAfter=5,
    ),
    "boxbody": ParagraphStyle(
        "boxbody", fontName="Helvetica", fontSize=11, leading=15.5,
        textColor=colors.black,
    ),
    "worksheet": ParagraphStyle(
        "worksheet", fontName="Helvetica-Bold", fontSize=12, leading=21,
        textColor=NAVY,
    ),
    "footer": ParagraphStyle(
        "footer", fontName="Helvetica", fontSize=9, leading=12,
        textColor=GRAY, alignment=TA_CENTER,
    ),
    "contact": ParagraphStyle(
        "contact", fontName="Helvetica", fontSize=11, leading=15.5,
        textColor=colors.white, alignment=TA_CENTER,
    ),
}


def box(flowables, bg, border):
    t = Table([[flowables]], colWidths=[6.7 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 1, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def step_header(text):
    t = Table([[Paragraph(text, styles["step"])]], colWidths=[6.7 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def P(text, style="body"):
    return Paragraph(text, styles[style])


story = []

# ---------------- Page 1 ----------------
story.append(P("Workers' Comp: Keep Paying the 5%,<br/>or Get Your Own Policy?", "title"))
story.append(Spacer(1, 4))
story.append(P("A simple step-by-step guide prepared for <b>Shaw Stonework</b>", "subtitle"))
story.append(Spacer(1, 6))
story.append(HRFlowable(width="100%", thickness=2.5, color=GOLD))
story.append(Spacer(1, 10))

story.append(box(
    [P("<b>What is happening right now</b>", "boxbody"),
     Spacer(1, 4),
     P("The contractors you work for keep <b>5 cents of every dollar</b> they owe you "
       "($5.00 per $100) to pay for workers' compensation insurance &mdash; the coverage "
       "that pays your medical bills and part of your lost wages if you get hurt on the "
       "job. <b>The question:</b> would it cost less to buy your own policy? "
       "Three easy steps tell you.", "boxbody")],
    LIGHT_BLUE, NAVY,
))
story.append(Spacer(1, 12))

# Step 1
story.append(step_header("STEP 1 &mdash; Add up what they took out of your pay last year"))
story.append(Spacer(1, 8))
story.append(P("Gather your pay records from last year &mdash; check stubs, settlement sheets, "
               "or your 1099 forms. Add up your <b>total pay before the 5% came out</b> "
               "(that total is called your \"gross pay\")."))
story.append(P("<b>Can't find your records?</b> Call each contractor's office and ask: "
               "<i>\"How much did you pay me last year, and how much did you hold out for "
               "workers' comp?\"</i> They keep those records."))
story.append(Spacer(1, 2))
story.append(box(
    [P("<b>Example:</b> If they paid you $80,000 last year &rarr; $80,000 &times; 0.05 = "
       "<b>$4,000</b>. That is what you paid for workers' comp last year.", "boxbody")],
    LIGHT_GOLD, GOLD,
))
story.append(Spacer(1, 8))
story.append(P("My total pay last year (before the 5%):&nbsp;&nbsp;$ ______________", "worksheet"))
story.append(P("&times; 0.05 &nbsp;=&nbsp; what I paid them for workers' comp:&nbsp;&nbsp;"
               "$ ______________ &nbsp;<font color='#C9971C'>(A)</font>", "worksheet"))
story.append(Spacer(1, 6))

# Step 2
story.append(step_header("STEP 2 &mdash; Figure what your own policy would cost"))
story.append(Spacer(1, 8))
story.append(P("We already checked on this for you. A policy of your own for stonework runs "
               "about <b>$8.61 per $100 of payroll</b>. So take your yearly payroll and "
               "multiply by 0.0861."))
story.append(Spacer(1, 2))
story.append(box(
    [P("<b>Example:</b> $80,000 of payroll &rarr; $80,000 &times; 0.0861 = about "
       "<b>$6,888</b> per year for your own policy.", "boxbody")],
    LIGHT_GOLD, GOLD,
))
story.append(Spacer(1, 8))
story.append(P("My yearly payroll:&nbsp;&nbsp;$ ______________", "worksheet"))
story.append(P("&times; 0.0861 &nbsp;=&nbsp; my own policy would cost about:&nbsp;&nbsp;"
               "$ ______________ &nbsp;<font color='#C9971C'>(B)</font>", "worksheet"))

story.append(PageBreak())

# ---------------- Page 2 ----------------
story.append(step_header("STEP 3 &mdash; Compare the two numbers"))
story.append(Spacer(1, 10))

compare = Table(
    [[Paragraph("<b>Staying with them</b>", styles["boxbody"]),
      Paragraph("<b>$5.00</b> per $100 &mdash; taken out of every check", styles["boxbody"])],
     [Paragraph("<b>Your own policy</b>", styles["boxbody"]),
      Paragraph("about <b>$8.61</b> per $100 of payroll", styles["boxbody"])]],
    colWidths=[2.4 * inch, 4.3 * inch],
)
compare.setStyle(TableStyle([
    ("GRID", (0, 0), (-1, -1), 0.75, NAVY),
    ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
    ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
]))
story.append(compare)
story.append(Spacer(1, 10))
story.append(box(
    [P("<b>The honest answer:</b> dollar for dollar, their $5.00 rate is cheaper than "
       "your own $8.61. On the same pay, <b>staying with the 5% costs less</b> &mdash; "
       "but the things below can change that.", "boxbody")],
    LIGHT_BLUE, NAVY,
))

story.append(P("Things that can change the answer", "h2"))
story.append(P("<b>1. Materials money.</b> The 5% comes out of <b>every dollar</b> they pay you "
               "&mdash; even money that really pays for stone, sand, and supplies. Your own policy "
               "is priced on <b>payroll only</b> &mdash; so if materials are a big part of your "
               "checks, your own policy may cost less than it looks.", "bullet"))
story.append(P("<b>2. Work for anyone else?</b> Their coverage only protects you on their jobs. "
               "Your own policy covers you on <b>every</b> job, for anybody.", "bullet"))
story.append(P("<b>3. Hiring helpers?</b> In North Carolina, a business with three or more "
               "employees generally must carry its own workers' comp &mdash; the 5% deal does "
               "not take care of that.", "bullet"))
story.append(P("<b>4. If you get your own policy,</b> we give each contractor a \"Certificate "
               "of Insurance\" &mdash; proof you are covered &mdash; so they stop taking the 5%. "
               "Confirm with them first that they will.", "bullet"))

story.append(P("What about liability insurance?", "h2"))
story.append(P("They are <b>two different things</b>. <b>Workers' comp</b> takes care of "
               "<b>you</b> if you get hurt working. <b>Liability</b> takes care of <b>other "
               "people</b> &mdash; damage to someone's property, or someone else getting hurt "
               "because of your work. The 5% they take out gives you <b>no liability coverage "
               "at all</b>. Most contractors expect you to carry your own liability policy too "
               "&mdash; the same certificate can show both, and we will check yours when you "
               "call."))

story.append(Spacer(1, 8))
story.append(box(
    [P("<b>Bottom line:</b> On rate alone, the 5% deal wins. But add up your real numbers "
       "from last year and bring them to us &mdash; we will run the exact comparison and "
       "check your liability too. About 15 minutes, and it costs nothing.", "boxbody")],
    LIGHT_GOLD, GOLD,
))
story.append(Spacer(1, 12))

contact = Table(
    [[Paragraph("<b>Bill Layne Insurance Agency</b><br/>"
                "1283 N Bridge St, Elkin, NC 28621<br/>"
                "Phone: (336) 835-1993 &nbsp;&bull;&nbsp; Bill@BillLayneInsurance.com<br/>"
                "www.BillLayneInsurance.com", styles["contact"])]],
    colWidths=[6.7 * inch],
)
contact.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), NAVY),
    ("TOPPADDING", (0, 0), (-1, -1), 10),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
]))
story.append(contact)
story.append(Spacer(1, 8))
story.append(P("This guide is general information, not legal or tax advice. Rates shown are "
               "estimates; your quote may vary. Coverage subject to policy terms and "
               "underwriting. NC License #6571216", "footer"))

doc = SimpleDocTemplate(
    OUT, pagesize=letter,
    leftMargin=0.9 * inch, rightMargin=0.9 * inch,
    topMargin=0.8 * inch, bottomMargin=0.8 * inch,
    title="Workers' Comp Decision Guide - Shaw Stonework",
    author="Bill Layne Insurance Agency",
)
doc.build(story)
print(f"Wrote {OUT}")
