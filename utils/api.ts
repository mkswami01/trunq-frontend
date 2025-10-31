const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1/voice";

export async function sendVoiceNote(audioBlob: Blob, endpoint: string) {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')


    console.log('Blob size:', audioBlob.size) 

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        throw new Error(`POST ${endpoint} failed: ${res.status}`);
    }

    return res.json();
}