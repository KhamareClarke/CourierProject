import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const { name, location } = await request.json();

    if (!name || !location) {
      return NextResponse.json(
        { error: 'Name and location are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('bins') // Ensure the 'bins' table exists in your database
      .insert({ name, location })
      .select()
      .single();

    if (error:any) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error:any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
