import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';


interface Artwork {
    id: number | string;
    title: string;
    description: string;
    imageUrl: string;
    url: string;
    dated: string;
    century: string;
    classification: string;
}

function ExhibitionView() {
    const [searchParams] = useSearchParams();
    const [exhibition, setExhibition] = useState<Artwork[]>(() => {
        //load from params if present
        const encoded = searchParams.get('items');
        if(encoded) {
            try{
                const decoded = JSON.parse(atob(encoded));//this decode base64
                if(Array.isArray(decoded)) return decoded as Artwork[];
            }catch (err){
                console.error('Invalid share link:', err);
            }
        }
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
    });
//generate shareable link
const shareLink = () => {
    const encoded = btoa(JSON.stringify(exhibition)); //Base64 encode
    return `${window.location.origin}/exhibition?items=${encoded}`;
};

    useEffect(() => {
        try{
        localStorage.setItem('exhibition',JSON.stringify(exhibition));
    }catch {}
    }, [exhibition]);

    return (
        <div className='container'>
            <h2>My exhibition({exhibition.length} items)</h2>
            <ul style={{ listStyle: 'none' }}> 
                {exhibition.map((art, index) => (
                    <li key={(art.id ?? index).toString()} style={{ marginBottom: '20px' }}>
                        <h3>{art.title}</h3>
                        {art.imageUrl && <img src={art.imageUrl} alt={art.title} style={{ maxWidth: '100%', height: 'auto' }} />}
                        <p>{art.description}</p>
                        <button onClick={() => setExhibition(exhibition.filter((_, i) => i !== index))}>Remove</button>
                    </li>
                    ))}
            </ul>
            <button onClick={() => navigator.clipboard.writeText(shareLink())}>Copy Share Link</button>
        </div>
    );
}






export default ExhibitionView;
