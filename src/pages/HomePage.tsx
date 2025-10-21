import React from "react";
import { useNavigate } from "react-router-dom";

const presets = ['Renaissance', 'Modern Art', 'Sculpture', 'Painting'];

export default function HomePage() {
    const navigate = useNavigate();

    function goToSearchWithPreset(preset: string){
        navigate(`/search?query=${encodeURIComponent(preset)}`);
    }
    return(
        <div className="home-super">
            <header className="home-header">
                <h1 className="home-title">Exhibition Curator</h1>
                <p className="home-subtitle">Discover artworks, build exhibitions and share them with the world</p>
                <div className="home-cta">
                    <button className="btn-primary" onClick={() => navigate('/search')}>Start Searching</button>
                    <button className="btn-spirit" onClick={() => navigate('/exhibition')}>My Exhibition</button>
                </div>
            </header>
            <main className="home-main">
                <section className="home-intro">
                    <h2>Explore curated collections</h2>
                    <p>Use the search to find artworks across multiple public museum APIs. 
                        Add favorites to your exhibition and create a shareable link.</p>
                </section>
                <section className="home-presets">
                    <h3>Quick presets</h3>
                    <p>Try a prestet to jump straight into a focused search:</p>
                    <div className="preset-buttons">{presets.map((p) => (
                        <button 
                        key={p} className="preset-btn"
                        onClick={() => goToSearchWithPreset(p)}
                        aria-label={`Search ${p}`}>{p}
                        </button>
                    ))}
                    </div>
                </section>
                <section className="home-features">
                    <h3>Features</h3>
                    <ul>
                        <li>Search multiple museum collections(Harvard, Met)</li>
                        <li>Add works to a local exhibition and persist to localStorage</li>
                        <li>Generate a shareable link for your collection</li>
                    </ul>
                </section>
            </main>
            <footer className="home-footer">
                <small>Built with React + TypeScript  Privacy-friendly - no user data leaves your browser</small>
            </footer>
        </div>
    );
}
