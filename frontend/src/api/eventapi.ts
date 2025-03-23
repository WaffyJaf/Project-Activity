import axios from 'axios';
export interface Event{
  post_id: number;
  post_content: string;
  post_date: string;
  post_status: string;
  post_url : string;
}

const APIEVENT_URL = "http://localhost:3000/event/getevent"

export async function Eventget(): Promise<Event[]> {
  try{
    const response = await axios<Event[]>(APIEVENT_URL);
    return response.data;
  }catch(error){
    console.error('Error fetching events:', error);
    throw error;
  } 
};