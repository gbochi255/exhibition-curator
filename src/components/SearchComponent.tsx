import { useState, useEffect } from "react";
import axios from "axios";


const HARVARD_API_KEY = 'd276f953-ce0a-46c4-8c70-a6728ea3f723';
const HARVARD_BASE_URL = 'https://api.harvardartmuseums.org/object';
const MET_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';

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

    function SearchComponent(){
        const [query, setQuery] = useState('');
        const [results, setResults] = useState<Artwork[]>([]);
        const [loading, setLoading] =useState(false);
        const [error, setError] = useState<string | null>(null);
        const [exhibition, setExhibition] = useState<Artwork[]>(() => JSON.parse(localStorage.getItem('exhibition') || '[]'));
        //load from storage on init
        const [sortBy, setSortBy] = useState('none'); //for sorting
        const [filterByClassification, setFilterByClassification] = useState('all'); //for filtering

        useEffect(() => { localStorage.setItem('exhibition', JSON.stringify(exhibition)); //save on storage
        console.log('Exhibition saved to localstorage:', exhibition);// debug
    }, [exhibition]);

        const handleSearch = async() => {
            setLoading(true);
            setError(null);
            setResults([]);
            let harvardArtworks: Artwork[] = [];
            let metArtworks: Artwork[] = [];
            try{
                const harvardResponse = await axios.get(`${HARVARD_BASE_URL}?q=${query}&apiKey=${HARVARD_API_KEY}&size=5`);
                harvardArtworks = harvardResponse.data.records.map((item: any) => ({
                   id: item.id,
                   title: item.title,
                    description: item.description,
                    imageUrl: item.primaryimageUrl || (item.images.length > 0 ? item.images[0].baseimageurl : undefined),//this handles images array
                    url: item.url,
                    dated: item.dated, 
                    century: item.century,
                    classification: item.classification,
                }));
            }catch (harvardErr) {
                console.error('Harvard Error:', harvardErr);
            }
            
            try{
                const metSearch = await axios.get(`${MET_BASE_URL}?q=${query}`);
            const metObjectIDs = metSearch.data.objectIDs.slice(0, 5) || [];
            if (metObjectIDs.length > 0){
         metArtworks = await Promise.all(
                metObjectIDs.map(async (id: number) => {
                
                        try{
                        const detail = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
                        const item = detail.data;
                        return {
                            id: item.objectID,
                            title: item.title,
                            description: item.objectName,
                            imageUrl: item.primaryImage,
                            url: item.objectUrlURL,
                            dated: item.objectDate,
                            century: item.objectEndDate ? `${Math.floor(item.objectEndDate / 100) + 1}th century` : undefined,
                            classification: item.classification,
                        };
                    }catch(detailErr){
                        console.error('Met Detail error for ID)', id, detailErr);
                        return null;
                    }
                    })
                ).then(art => art.filter(Boolean) as Artwork[]);
            }
        }catch (metErr) {
            console.error('Met Error:', metErr)
        }
        let combined = [...harvardArtworks, ...metArtworks];
        //apply filter if selected
        if (filterByClassification !== 'all') {
            combined = combined.filter(art => art.classification === filterByClassification);
        }
                
                if (harvardArtworks.length === 0 && 
                    metArtworks.length === 0){
                    setError('No artworks found for this query. Try broader terms like "art" or remove filters.' );
                }
                //apply sort
                if (sortBy === 'dateAsc') {
                    combined.sort((a, b) => (a.dated || '').localeCompare(b.dated || ''));
                } else if (sortBy === 'dateDesc') {
                    combined.sort((a, b) => (b.dated || '').localeCompare(a.dated || ''));
                } else if (sortBy === 'classification') {
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
                <h2>Search Artworks</h2>
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter keyword (e.g, Mona Lisa)" />
                 <button onClick={handleSearch} disabled={loading}>Search</button>
                 <div className="presets-container" style={{ display: "flex", flexWrap: "wrap" }}>
                    <h3>Presets</h3>
                    {presets.map((preset) => (
                        <button key={preset} onClick={() => { setQuery(preset); handleSearch();}} disabled={loading} style={{ margin: '5px' }}>
                            {preset}
                        </button>
                    ))}
                 </div>
                 {/*  filter Dropdown */}
                 <div>
                    <label>Filter By Classification: </label>
                    <select value={filterByClassification} onChange={(e) => { setFilterByClassification(e.target.value); handleSearch(); }}>
                        <option value="all">ALL</option>
                        <option value="Paintings">Paintings</option>
                        <option value="Sculpture">Sculpture</option>
                    </select>
                 </div>
                 {/* Sort Dropdown */}
                 <div>
                    <label>Sort By: </label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="none">None</option>
                        <option value="dateAsc">Date Ascending</option>
                        <option value="dateDesc">Date Descending</option>
                        <option value="classification">Classification</option>
                    </select>
                 </div>
                 {loading && <p>Loading...</p>}
                 {error && <p style={{ color: 'red' }}>{error}</p>}
                 <ul style={{ listStyle: 'none' }}>
                    {results.map((art) => (
                        <li key={art.id} style={{ marginBottom: '20px', display: "flex", flexDirection: "column", alignItems: "center" }}>
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