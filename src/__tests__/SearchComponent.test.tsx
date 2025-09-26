import  { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    test('shows loading during search', async () => {
        render(<SearchComponent />);
        await userEvent.click(screen.getByText('Search'));
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
    test('renders presets and they are clickable', () => {
        render(<SearchComponent />);
        expect(screen.getByText('Renaissance')).toBeInTheDocument();
        const presetButton = screen.getByText('Renaissance');
        expect(presetButton).toBeEnabled();
    })

    
    });
