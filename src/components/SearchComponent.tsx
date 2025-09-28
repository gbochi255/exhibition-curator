import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "react-spinners/PulseLoader";
import { toast, ToastContainer } from "react-toastify";


const HARVARD_API_KEY = 'd276f953-ce0a-46c4-8c70-a6728ea3f723';
const HARVARD_BASE_URL = 'https://api.harvardartmuseums.org/object';
const MET_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';

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

    function SearchComponent(){
        const [query, setQuery] = useState('');
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

        const handleSearch = async(overrides?:{
            query?: String;
            filterByClassification?: string;
            sortBy?: string;
        }) => {
            
            setLoading(true);
            setError(null);
            setResults([]);

            const activeQuery = overrides?.query ?? query;
            const activeFilter = overrides?.filterByClassification ?? filterByClassification;
            const activeSort = overrides?.sortBy ?? sortBy;
            
            let harvardArtworks: Artwork[] = [];
            let metArtworks: Artwork[] = [];

            try{
                const harvardResponse = await axios.get(`${HARVARD_BASE_URL}?q=${query}&apiKey=${HARVARD_API_KEY}&size=5`);
                const records = Array.isArray(harvardResponse.data.records) ? harvardResponse.data.records : [];
               // harvardArtworks = harvardResponse.data.records.map((item: any, index: number) => ({
                    harvardArtworks = records.map((item: any, index: number) => {
                        const primaryImage = item.primaryimageurl ?? item.primaryimageUrl ?? undefined;
                        const imagesArray = Array.isArray(item.images) ? item.images : [];
                        const fallbackImage = imagesArray.length > 0 ? (imagesArray[0].baseimageurl ?? imagesArray[0].baseImageUrl) :undefined;
                   
                      return{
                        id: item.id ?? `harvard-${index}`,
                        title: item.title ?? 'Untitled',
                        description: item.description ?? '',
                        imageUrl: primaryImage ?? fallbackImage,
                        url: item.url ?? undefined,
                        dated: item.dated ?? undefined,
                        century: item.century ?? undefined,
                        classification: item.classification ?? undefined
                      }  as Artwork;
                    /*id: item.id,
                   title: item.title,
                    description: item.description,
                    imageUrl: item.primaryimageUrl || (item.images.length > 0 ? item.images[0].baseimageurl : undefined),//this handles images array
                    url: item.url,
                    dated: item.dated, 
                    century: item.century,
                    classification: item.classification,*/
                });
            }catch (harvardErr) {
                console.error('Harvard Error:', harvardErr);
                toast.error('Failed to fetch artworks. Please try again')
                
            }
            
            try{
                const metSearch = await axios.get(`${MET_BASE_URL}?q=${query}`);
            //const metObjectIDs = metSearch.data.objectIDs.slice(0, 5) || [];
            const objectIDs = Array.isArray(metSearch.data.objectIDs) ? metSearch.data.objectIDs.slice(0, 5) : [];
            if (objectIDs.length > 0){
            //metArtworks = await Promise.all(
                const metResults = await Promise.all(
                objectIDs.map(async (id: number) => {
                
                        try{
                        const detail = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
                        const item = detail.data ?? {};
                        return {
                            id: item.objectID ?? `met-${id}`,
                            title: item.title ?? 'Untitled',
                            description: item.objectName ?? '',
                            imageUrl: item.primaryImage ?? item.primaryImageSmall ?? undefined,
                            url: item.objectUrlURL ?? undefined,
                            dated: item.objectDate ?? undefined,
                            century: item.objectEndDate ? `${Math.floor(item.objectEndDate / 100) + 1}th century` : undefined,
                            classification: item.classification ?? undefined
                        } as Artwork;
                    }catch(detailErr){
                        console.error('Met Detail error for ID)', id, detailErr);
                        return null;
                    }
                    })
                ).then(art => art.filter(Boolean) as Artwork[]);
            }
        }catch (metErr) {
            console.error('Met Error:', metErr)
            toast.error('Failed to fetch artworks. Please try again')
        }
        let combined = [...harvardArtworks, ...metArtworks];
        //apply filter if selected
        if (activeFilter !== 'all'){
            combined = combined.filter(art => art.classification === activeFilter);
        }
        
        if (activeSort === 'dateAsc') {
            combined.sort((a, b) => (a.dated || '').localeCompare(b.dated || ''));
        } else if (activeSort === 'dateDesc') {
            combined.sort((a, b) => (b.dated || '').localeCompare(a.dated || ''));
        } else if (activeSort === 'classification') {
            combined.sort((a, b) => (a.classification || '').localeCompare(b.classification || ''));
        }
        
        setResults(combined);
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
                        onChange={(e) => { const v = e.target.value;
                        setFilterByClassification(v); 
                        handleSearch({ filterByClassification: v }); }}>
                        <option value="all">ALL</option>
                        <option value="Paintings">Paintings</option>
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
                            const v = e.target.value;
                            setSortBy(v);
                            handleSearch({ sortBy: v });
                        }}>
                        <option value="none">None</option>
                        <option value="dateAsc">Date Ascending</option>
                        <option value="dateDesc">Date Descending</option>
                        <option value="classification">Classification</option>
                    </select>
                 </div>
                 {loading && <Spinner color="#007bff" aria-label="search-loading" data-testid="search-spinner" role="progressbar" /> }
                 {error && <p style={{ color: 'red' }}>{error}</p>}
                 <ul style={{ listStyle: 'none' }}>
                    {results.map((art, idx) => (
                        <li key={(art.id ?? idx).toString()} style={{ marginBottom: '20px', display: "flex", flexDirection: "column", alignItems: "center" }}>
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