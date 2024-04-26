import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ message: 'Missing required query parameters: year and month' });
  }
  
  try {
    const supabase = createClient(process.env.SUPABASE_CLIENT, process.env.SUPABASE_ANON);
    
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-${new Date(year, month, 0).getDate()}`;

    let { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (invoicesError) throw invoicesError;

    let { data: correctionData, error: correctionError } = await supabase
      .from('correction_invoices')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (correctionError) throw correctionError;

    // Replace invoices with their corrections
    correctionData.forEach(correction => {
      // Użyj `invoice_id` zamiast `original_invoice_id`
      const index = invoicesData.findIndex(invoice => invoice.id === correction.invoice_id);
      console.log(`Szukanie korekty dla faktury o ID: ${correction.invoice_id}. Znaleziono? ${index !== -1 ? 'Tak' : 'Nie'}`);
    
      if (index !== -1) {
        console.log(`Zastępowanie faktury o ID: ${invoicesData[index].id} korektą o ID: ${correction.id}`);
        invoicesData[index] = correction;
        // Logging the replaced data for verification
      } else {
        // If no duplicate is found, log that information as well
        console.log(`No duplicate found for original_invoice_id: ${correction.original_invoice_id}.`);
      }
    });
    

    let totalNetValueSum = 0;
    let totalVatValue = 0;

    invoicesData.forEach(invoice => {
      invoice.products.forEach(product => {
        const productTotalValue = parseFloat((product.quantity * product.unit_price / 100).toFixed(2));
        const vatValue = parseFloat((productTotalValue * product.vat_rate).toFixed(2));
        totalNetValueSum += productTotalValue;
        totalVatValue += productTotalValue + vatValue;
      });
    });
    
    const transformedInvoicesData = {};
    
    invoicesData.forEach(invoice => {
      const buyerName = invoice.buyer && invoice.buyer.name ? invoice.buyer.name : "Nieznany kupujący";
      const invoiceDate = invoice.date ? invoice.date : "Nieznana data";
      const identifier = `Faktura ${buyerName} z dnia ${invoiceDate}`;
    
      let invoiceValueVat = 0;
      if (invoice.products && Array.isArray(invoice.products)) {
        invoice.products.forEach(product => {
          const productTotalValue = parseFloat((product.quantity * product.unit_price / 100).toFixed(2));
          const vatValue = parseFloat((productTotalValue * product.vat_rate).toFixed(2));
          invoiceValueVat += productTotalValue + vatValue;
        });
      }
    
      // Dodaj wartość VAT do odpowiedniego klucza w obiekcie
      if (!transformedInvoicesData[identifier]) {
        transformedInvoicesData[identifier] = [invoiceValueVat];
      } else {
        transformedInvoicesData[identifier].push(invoiceValueVat);
      }
    });



    res.status(200).json({
      totalNetValue: parseFloat(totalNetValueSum.toFixed(2)),
      totalVatValue: parseFloat(totalVatValue.toFixed(2)),
      transformedInvoicesData
    });
  } catch (error) {
    console.error('Error accessing the database:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
