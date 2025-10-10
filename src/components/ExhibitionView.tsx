import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';


interface Artwork {
    id: number | string;
    title?: string;
    description?: string;
    imageUrl?: string | null;
    url?: string;
    dated?: string;
    century?: string;
    classification?: string;
}
const safeBase64Encode = (str: string) => {
if (typeof btoa === 'function') return btoa(str);
if (typeof (globalThis as any).buffer !== 'undefined') {
    return (globalThis as any).buffer.from(str, 'utf8').toString('base64');
    }
    throw new Error('No base64 encoder available');
};

const safeBase64Decode = (s: string) => {
    if(typeof atob === 'function') return atob(s);
    if(typeof (globalThis as any).buffer !== 'undefined') {
        return (globalThis as any).buffer.from(s, 'base64').toString('utf8');
    }
    throw new Error('No base64 decoder available');
};


function ExhibitionView() {
    const [searchParams] = useSearchParams();
    const [exhibition, setExhibition] = useState<Artwork[]>(() => {
        //load from params if present
        
            try{
                const encoded = searchParams.get('items');
                if(encoded) {//decode base64 and parse to json
                    const decoded = safeBase64Decode(encoded);
                    const parsed = JSON.parse(decoded);//this decode base64
                if(Array.isArray(parsed)) return parsed as Artwork[];
                }
            }catch (err){
            console.error('Invalid share link:', err);
        }
        
        try{
            const stored = localStorage.getItem('exhibition');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed as Artwork[];}
            }
            return [];
        }catch (err) {
            //console.error('Failed to load exhibition from storage:', err);
            }
        return [];});
    //to keep localstorage in sync whenever exhibition changes
    useEffect(() => {
        try{
            localStorage.setItem('exhibition', JSON.stringify(exhibition));

        }catch (err) {
            console.error('Failed to persist exhibition', err)
        }
    }, [exhibition]);
//generate shareable link
const shareLink = (): string => {
    try {
        const encoded = safeBase64Encode(JSON.stringify(exhibition)); //Base64 encode
    return `${window.location.origin}/exhibition?items=${encoded}`;
    }catch (err) {
        //console.error('Could not build Share link:', err)
       return  `${window.location.origin}/exhibition`;
    }
};
    const copyShareLink = async () => {
        try{
            await navigator.clipboard.writeText(shareLink());
        }catch (err) {
            console.error('Failed to copy', err)
        }
    };
    
return (
        <div className='container'>
            <h2>My exhibition({exhibition.length} item{exhibition.length === 1 ? '' : 's'})</h2>
            {exhibition.length === 0 && <p>No items in your exhibition</p>}
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}> 
                {exhibition.map((art, idx) => (
                    <li key={(art.id ?? idx).toString()} style={{ marginBottom: '20px' }}>
                        <h3>{art.title ?? 'Untitled'}</h3>
                        {art.imageUrl && (<img src={art.imageUrl as string} alt={art.title ?? 'artwork'} style={{ maxWidth: '100%', height: 'auto' }} />
                    )}
                        {art.description && <p>{art.description}</p>}
                        <p>Dated: {art.dated ?? art.century ?? ''}</p>
                        {art.classification && <p>Classification: {art.classification}</p>}
                        {art.url && (
                            <p>
                                <a href={art.url} target='_blank' rel='noopener noreferrer'>More Info</a>
                            </p>
                        )}
                        <div style={{ marginTop: 8 }}>
                <button onClick={() => setExhibition(exhibition.filter((_, i) => i !== idx ))}>Remove</button>

            </div>
                    </li>
                    ))}
            </ul>
            <div style={{ marginTop: 12 }}>
                <button onClick={copyShareLink}>Copy Share Link</button>
            </div>
        </div>
    );
}export default ExhibitionView;
