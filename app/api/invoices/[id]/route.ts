import { type NextRequest, NextResponse } from "next/server"
import { query, sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoice = await query(sql`
      SELECT i.*, s.name as supplier_name, s.email as supplier_email,
             s.address as supplier_address, c.code as currency_code, c.symbol as currency_symbol
      FROM invoices i
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      LEFT JOIN currencies c ON i.currency_id = c.id
      WHERE i.id = ${params.id}
    `)

    if (!invoice[0]) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Get invoice items
    const items = await query(sql`
      SELECT * FROM invoice_items WHERE invoice_id = ${params.id}
      ORDER BY created_at ASC
    `)

    return NextResponse.json({ ...invoice[0], items })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const {
      invoice_number,
      supplier_id,
      issue_date,
      due_date,
      total_amount,
      currency_id,
      total_amount_tnd,
      exchange_rate,
      status,
      payment_terms,
      notes,
    } = body

    const invoice = await query(sql`
      UPDATE invoices 
      SET invoice_number = ${invoice_number}, supplier_id = ${supplier_id},
          issue_date = ${issue_date}, due_date = ${due_date}, total_amount = ${total_amount},
          currency_id = ${currency_id}, total_amount_tnd = ${total_amount_tnd},
          exchange_rate = ${exchange_rate}, status = ${status}, payment_terms = ${payment_terms},
          notes = ${notes}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `)

    if (!invoice[0]) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice[0])
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}
