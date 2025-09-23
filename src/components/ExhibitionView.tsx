import { useState, useEffect } from 'react'


interface Artwork {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    url: string;
    dated: string;
    century: string;
    classification: string;
}

function ExhibitionView() {
    const [exhibition, setExhibition] = useState<Artwork[]>(() => {
        try{
            const stored = localStorage.getItem('exhibition');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed as Artwork[];
                }
            }
            return [];

        }catch (err) {
            console.error('Failed to load exhibition from storage:', err);
            return [];
        }
    })

    useEffect(() => {
        localStorage.setItem('exhibition',JSON.stringify(exhibition));
    }, [exhibition]);

    return (
        <div className='container'>
            <h2>My exhibition({exhibition.length} items)</h2>
            <ul style={{ listStyle: 'none' }}> 
                {exhibition.map((art, index) => (
                    <li key={index} style={{ marginBottom: '20px' }}>
                        <h3>{art.title}</h3>
                        {art.imageUrl && <img src={art.imageUrl} alt={art.title} style={{ maxWidth: '100%', height: 'auto' }} />}
                        <p>{art.description}</p>
                        <button onClick={() => setExhibition(exhibition.filter((_, i) => i !== index))}>Remove</button>
                    </li>
                    ))}
                 </ul>
                 </div>
    );
}






export default ExhibitionView;
