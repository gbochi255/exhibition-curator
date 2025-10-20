import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Spinner from "react-spinners/PulseLoader";
import { toast, ToastContainer } from "react-toastify";


const HARVARD_API_KEY = (import.meta.env.VITE_HARVARD_API_KEY ?? '') as string;

const HARVARD_BASE_URL = 'https://api.harvardartmuseums.org/object';
const MET_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';

if(!HARVARD_API_KEY && import.meta.env.MODE !== 'test') {

    console.warn('VITE_HARVARD_API_KEY not set. API calls may fail.');
}

interface Artwork {
    id: number | string;
    title?: string;
    description?: string;
    imageUrl?: string;
    url?: string;
    dated?: string;
    century?: string;
    classification?: string;
}

    function SearchComponent(){
        const [query, setQuery] = useState('');
        const [rawResults, setRawResults] = useState<Artwork[]>([]);
        const [results, setResults] = useState<Artwork[]>([]);
        const [loading, setLoading] =useState(false);
        const [error, setError] = useState<string | null>(null);
        const [recentlyAdded, setRecentlyAdded] = useState<Record<string, boolean>>({});
        const [exhibition, setExhibition] = useState<Artwork[]>(() => {
            try{
            return JSON.parse(localStorage.getItem('exhibition') || '[]'); 
        }catch {
            return []
        }
    }
    );
        
        const [sortBy, setSortBy] = useState('none'); 
        const [filterByClassification, setFilterByClassification] = useState('all'); 

        useEffect(() => { 
            try{
            localStorage.setItem('exhibition', JSON.stringify(exhibition)); 
            
        }catch (e) {

        }
        console.log('Exhibition saved to localstorage:', exhibition);
        
    }, [exhibition]);
    
    function applyFilterAndSort(data: Artwork[], filter: string, sort: string) {
        let out = Array.isArray(data) ? [...data] : [];
        if(filter !== 'all') {
            out = out.filter((art) => (art.classification ?? '').toLowerCase() === filter.toLocaleLowerCase());
            }
            if(sort === 'dateAsc') {
                out.sort((a, b) =>((a.dated ?? '')).localeCompare((b.dated ?? '')));
            }else if(sort === 'dateDesc'){
                out.sort((a, b) => ((b.dated ?? '')).localeCompare((a.dated ?? '')));
            }else if(sort ==='classification') {
                out.sort((a, b) => ((a.classification ?? '')).localeCompare((b.classification ?? '')));
            }
            return out;
            }
            
            useEffect(() => {
                setResults(applyFilterAndSort(rawResults, filterByClassification, sortBy));
            }, [rawResults, filterByClassification, sortBy]);

        const handleSearch = async(overrides?: {
            query?: string;
            filterByClassification?: string;
            sortBy?: string;
        }) => {
            
            const activeQuery = overrides?.query ?? query;
            const activeFilter = overrides?.filterByClassification ?? filterByClassification;
            const activeSort = overrides?.sortBy ?? sortBy;
            
            if(!activeQuery || activeQuery.trim().length === 0){
                setRawResults([]);
                setResults([]);
                setError(null);
                return;
            }
            
            setLoading(true);
            setError(null);
            setResults([]);
            setRawResults([]);

            let harvardArtworks: Artwork[] = [];
            let metArtworks: Artwork[] = [];

            try{
                const q = encodeURIComponent(activeQuery);
                const key = HARVARD_API_KEY ? encodeURIComponent(HARVARD_API_KEY) : '';
                const harvardUrl = `${HARVARD_BASE_URL}?q=${q}${key ? `&apikey=${key}` : ''}&size=25`;
                
                const harvardResponse = await axios.get(harvardUrl);

                const records = harvardResponse?.data && Array.isArray(harvardResponse.data.records)
                ? harvardResponse.data.records : [];

                    harvardArtworks = records.map((item: any, index: number) => {
                        const primaryImage = item.primaryimageurl ?? item.primaryimageUrl ?? undefined;
                        
                        const imagesArray = Array.isArray(item.images) ? item.images : [];
                        const fallbackImage = imagesArray.length > 0 ? (imagesArray[0].baseimageurl ?? imagesArray[0].baseImageUrl) : undefined;

                        
                   
                      return{
                            id: (item && (item.id ?? `harvard-${index}`)) as number | string,
                            title: (item && typeof item.title === 'string') ? item.title : 'Untitled',
                            description: (item && typeof item.description === 'string') ? item.description : '',
                            imageUrl: primaryImage ?? fallbackImage,
                            url: (item && typeof item.url === 'string') ? item.url : undefined,
                            dated: (item && typeof item.dated === 'string') ? item.dated : undefined,
                            century: (item && typeof item.century === 'string') ? item.century : undefined,
                            classification: (item && typeof item.classification === 'string') ? item.classification : undefined
                        }  as Artwork;
                    });
            }catch (harvardErr) {
                console.error('Harvard Error:', harvardErr);
                toast.error('Failed to fetch artworks. Please try again')
                }
            
            try{
                const metSearchUrl = `${MET_BASE_URL}?q=${encodeURIComponent(activeQuery || '')}`;
                const metSearch = await axios.get(metSearchUrl);
                
            const objectIDs = metSearch?.data && Array.isArray (metSearch.data.objectIDs) ? metSearch.data.objectIDs.slice(0, 5) : [];
            
            if (objectIDs.length > 0){
                const metResults = await Promise.all(
                objectIDs.map(async (id: number) => {
                    try{
                        const detail = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
                        const item = detail && detail.data ? detail.data : {};
                        return {
                            id: item.objectID ?? `met-${id}`,
                            title: typeof item.title === 'string' ? item.title : 'Untitled',
                            description: typeof item.objectName === 'string' ? item.objectName : '',
                            imageUrl: typeof item.primaryImage === 'string' ? item.primaryImage : (typeof item.primaryImageSmall === 'string' ? item.primaryImageSmall : undefined),
                            url: typeof item.objectURL === 'string' ? item.objectURL : undefined,
                            dated: typeof item.objectDate === 'string' ? item.objectDate : undefined,
                            century: item.objectEndDate ? `${Math.floor(item.objectEndDate / 100) + 1}th century` : undefined,
                            classification: typeof item.classification === 'string' ? item.classification : undefined
                        } as Artwork;
                    }catch(detailErr){
                        console.error('Met Detail error for ID)', id, detailErr);
                        return null;
                    }
                    })
                );
                metArtworks = metResults.filter(Boolean) as Artwork[];
            }
        }catch (metErr) {
            console.error('Met Error:', metErr)
            toast.error('Failed to fetch artworks. Please try again')
        }
        let combined = [...harvardArtworks, ...metArtworks];
        if(activeFilter && activeFilter !== 'all') {
            combined = combined.filter((art) => art.classification === activeFilter);
        }
        if (activeSort === 'dateAsc') {
            combined.sort((a, b) => (a.dated || '').localeCompare(b.dated || ''));
        }else if (activeSort === 'dateDesc'){
            combined.sort((a, b) => (b.dated || '').localeCompare(a.dated || ''));
        }else if (activeSort === 'classification') {
            combined.sort((a, b) => (a.classification || '').localeCompare(b.classification || ''));
        }
        
        setResults(combined);
        setRawResults(combined);
        
            if (combined.length === 0){
                    setError('No artworks found. Try "art" or "mona lisa".');
                }
                setLoading(false);
            };
            
        const presets = ['Renaissance', 'Modern Art', 'Sculpture', 'Painting'];

        

        return (
            <div className="container">
                <ToastContainer />
                <h2>Search Artworks</h2>
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter keyword (e.g, Mona Lisa)" />
                 <button onClick={() => handleSearch()} disabled={loading}>Search</button>
                 <div className="presets-container" style={{ display: "flex", flexWrap: "wrap" }}>
                    <h3>Presets</h3>
                    {presets.map((preset) => (
                        <button key={preset} onClick={() => { setQuery(preset); handleSearch({ query: preset });
                        }} disabled={loading} style={{ margin: '5px' }}>
                            {preset}
                        </button>
                    ))}
                 </div>
                 
                 
                 <div>
                    <label htmlFor="filter-select">Filter By Classification: </label>
                    <select 
                        id="filter-select" 
                        value={filterByClassification} 
                        onChange={(e) => { setFilterByClassification(e.target.value); }}>
                        <option value="all">ALL</option>
                        <option value="Painting">Painting</option>
                        <option value="Sculpture">Sculpture</option>
                    </select>
                 </div>
                 
                 <div>
                    <label htmlFor="sort-select">Sort By:</label>
                    <select 
                        id="sort-select" 
                        value={sortBy} 
                        onChange={(e) => {
                          setSortBy(e.target.value);
                        }}>
                        <option value="none">None</option>
                        <option value="dateAsc">Date Ascending</option>
                        <option value="dateDesc">Date Descending</option>
                        <option value="classification">Classification</option>
                    </select>
                 </div>
                 {loading && (
                    <div data-testid="search-spinner" role="status" aria-label="search-loading" style={{ margin: '8px 0' }}><Spinner color="#007bff" /> 
                    </div>)}
                 {error && <p style={{ color: 'red' }}>{error}</p>}
                 <ul style={{ listStyle: 'none' }}>
                    {results.map((art, idx) => (
                        <li role="listitem" key={(art.id ?? idx).toString()} style={{ marginBottom: '20px', display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <h3>{art.title}</h3>
                            {art.imageUrl && <img src={art.imageUrl} alt={art.title} style={{ maxWidth: '100%', height: 'auto' }} />}
                            <p>{art.description}</p>
                            <p>Dated: {art.dated || art.century}</p>
                            <p>Classification: {art.classification}</p>
                            <a href={art.url} target="_blank" rel="noopener noreferrer">More Info</a>
                            <button onClick={() => {
                                const removalTimersRef = useRef<Record<string, number>>({});
                                function addToExhibition(art: Artwork) {
                                    setExhibition(prev => {
                                        return [...prev, art];
                                    });
                                    toast.success('Added to exhibition', { autoClose: 1500, hideProgressBar: true});
                                    const idKey = String(art.id);
                                setRecentlyAdded(prev => ({ ...prev, [idKey]: true }));

                                if(removalTimersRef.current[idKey]){
                                    clearTimeout(removalTimersRef.current[idKey]);
                                }
                                const timerId = window.setTimeout(() => {
                                    setRecentlyAdded(prev => {
                                        const copy = { ...prev };
                                        delete copy[idKey];
                                            return copy;
                                });
                                delete removalTimersRef.current[idKey];
                                }, 1500);
                                removalTimersRef.current[idKey] = timerId;

                                useEffect(() => {
                                    return () => {
                                        const timers = removalTimersRef.current;
                                        Object.keys(timers).forEach(k => {
                                            clearTimeout(timers[k]);
                                            delete timers[k];
                                        });
                                    };
                                }, []);
                                /*setExhibition(prev => {
                                    const next = [...exhibition, art];
                                return next; });
                            toast.success('Added to exhibition');
                        const idKey = String(art.id);
                    setRecentlyAdded(prev => ({ ...prev, [idKey]: true }));
                setTimeout(() => {
                    setRecentlyAdded(prev => {
                        const copy = { ...prev };
                        delete copy[idKey];
                            return copy;
                    })
                    }, 1500);*/
                    }}} >
                {recentlyAdded[String(art.id)] ? 'Copied' : 'Add to Exhibition'}</button>
                        </li>
                    ))}</ul>
            </div>
        );
    }

    export default SearchComponent;