import  { render, screen } from '@testing-library/react';
import SearchComponent from '../components/SearchComponent';

describe('SearchComponent', () => {
    test('renders the component correctly', () => {
        render(<SearchComponent />);
        expect(screen.getByText('Search Artworks')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter keyword (e.g, Mona Lisa)')).toBeInTheDocument();

    });
    test('renders presets', ()=> {
        render(<SearchComponent />);
        expect(screen.getByText('Renaissance')).toBeInTheDocument();
    });

    
    });
