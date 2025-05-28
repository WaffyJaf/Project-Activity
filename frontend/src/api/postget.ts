import axios from 'axios';

export interface Event {
  post_id: number;
  post_content: string;
  post_date: string;
  post_status: string;
  imge_url: string;
}

export async function Eventget(): Promise<Event[]> {
  try {
    const response = await axios.get("http://localhost:3000/event/getevent");
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

export const fetchPostByUser = async (ms_id: string): Promise<Event[]> => {
  try {
    const response = await axios.get(`http://localhost:3000/getby/post/${ms_id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;
    if (!Array.isArray(data)) {
      console.error('Received non-array data:', data);
      return [];
    }

    return data.map((post: any) => ({
      ...post,
      post_date: post.post_date ? (typeof post.post_date === 'string' ? post.post_date : new Date(post.post_date).toISOString()) : null,
      post_datetime: post.post_datetime ? (typeof post.post_datetime === 'string' ? post.post_datetime : new Date(post.post_datetime).toISOString()) : null,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return [];
  }
};

export async function updateEvent(eventData: Event): Promise<any> {
  try {
    const response = await axios.put(
      `http://localhost:3000/event/updatepost/${eventData.post_id}`,
      {
        post_content: eventData.post_content,
        post_status: eventData.post_status
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

export const deleteEvent = async (post_id: number) => {
  try {
    const response = await axios.delete(`http://localhost:3000/event/deletepost/${post_id}`);
    return response.data;
  } catch (error) {
    throw new Error('ไม่สามารถลบกิจกรรมได้');
  }
};


