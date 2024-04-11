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
    // Inicjalizacja klienta Supabase
    const supabase = createClient(process.env.SUPABASE_CLIENT, process.env.SUPABASE_ANON);
    
    // Twoje zapytanie do Supabase
    const { data, error } = await supabase
      .from('salaries')
      .select('*')
      .eq('year', year)
      .eq('month', month);
       // Zwracanie danych jako odpowiedź JSON
  res.status(200).json(data);
  console.log('Supabase Salaries Data fetched successfully');
} catch (error) {
  console.error('Error accessing the database:', error);
  res.status(500).json({ message: 'Internal Server Error' });
}
}
