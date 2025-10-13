import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "react-spinners/PulseLoader";
import { toast, ToastContainer } from "react-toastify";


const HARVARD_API_KEY = '601d8cbb-11c2-4343-be4a-5f267348059f';
const HARVARD_BASE_URL = 'https://api.harvardartmuseums.org/object';
const MET_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';

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
        const [exhibition, setExhibition] = useState<Artwork[]>(() => {
            try{
            return JSON.parse(localStorage.getItem('exhibition') || '[]'); 
        }catch {
            return []
        }
    }
    );
        //load from storage on init
        const [sortBy, setSortBy] = useState('none'); //for sorting
        const [filterByClassification, setFilterByClassification] = useState('all'); //for filtering

        useEffect(() => { 
            try{
            localStorage.setItem('exhibition', JSON.stringify(exhibition)); //save on storage
            console.log('Exhibition saved to localstorage:', exhibition);// debug
        }catch (e) {

        }
        console.log('Exhibition saved to localstorage:', exhibition);
        
    }, [exhibition]);
    //apply filter + sort to an array
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
            //when sort or filter changes, re-drive results from rawResults(no network call)
            useEffect(() => {
                setResults(applyFilterAndSort(rawResults, filterByClassification, sortBy));
            }, [rawResults, filterByClassification, sortBy]);

        const handleSearch = async(overrides?:{
            query?: string;
            filterByClassification?: string;
            sortBy?: string;
        }) => {
            const activeQuery = overrides?.query ?? query;
            if(!activeQuery || activeQuery.trim().length === 0){
                //if query is empty, clear results and don't call APIs
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
                const harvardUrl = `${HARVARD_BASE_URL}?q=${encodeURIComponent(activeQuery || '')}&apikey=${HARVARD_API_KEY}&size=15`;
                
                const harvardResponse = await axios.get(harvardUrl);

                const records = harvardResponse && harvardResponse.data && Array.isArray(harvardResponse.data.records)
                ? harvardResponse.data.records : [];

                    harvardArtworks = records.map((item: any, index: number) => {
                        const primaryImage = (item && typeof item.primaryimageurl === 'string') ? item.primaryimageurl : 
                        (item && typeof item.primaryimageUrl === 'string') ? item.primaryimageUrl : undefined;

                        let fallbackImage: string | undefined = undefined;
                        if(item && Array.isArray(item.images) && item.images.length > 0) {
                            const first = item.images[0];
                            if(first) {
                                if(typeof first.baseimageurl === 'string') fallbackImage = first.baseimageurl;
                                else if (typeof first.baseImageUrl === 'string') fallbackImage = first.baseImageUrl;
                            }
                        }
                   
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
                
            const objectIDs = metSearch && metSearch && Array.isArray (metSearch.data.objectIDs) 
            ? metSearch.data.objectIDs.slice(0, 5) : [];
            
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
        setRawResults(combined);
        setResults(applyFilterAndSort(combined, filterByClassification, sortBy));
        
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
                 
                 {/*  filter Dropdown */}
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
                 {/* Sort Dropdown */}
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
                            <button onClick={() => setExhibition([...exhibition, art])}>Add to Exhibition</button>
                        </li>
                    ))}</ul>
            </div>
        );
    }

    export default SearchComponent;