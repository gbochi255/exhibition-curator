import  { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

import SearchComponent from '../components/SearchComponent';
jest.mock('axios');
//const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SearchComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });
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

        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars.length).toBeGreaterThan(0);
        //expect(screen.getAllByRole('progressbar')).toBeInTheDocument();
        //expect(screen.getByLabelText('search-loading')).toBeInTheDocument();
    });
    test('renders presets and they are clickable', () => {
        render(<SearchComponent />);
        expect(screen.getByText('Renaissance')).toBeInTheDocument();
        const presetButton = screen.getByText('Renaissance');
        expect(presetButton).toBeEnabled();
    })
    test('filters results by classification', async () => {
        const harvardResp = {data: 
            {records: [{ id: 1, title: 'Painting Art', classification: 'Painting' },
                        { id: 2, title: 'Sculpture Art', classification: 'Sculpture' }] } };
            const metSearchResp = { data: 
                    { objectIDs: [] } };
                    const getSpy = jest.spyOn(axios, 'get').mockImplementation((arg: unknown) => {
                        let u = '';
            if (typeof arg === 'string'){
                u = arg;
            }else if (arg && typeof(arg as any).url === 'string'){
                u = (arg as any).url;
            }
                if(u.includes('harvardartmuseums') || u.includes('harvard')) {
                    return Promise.resolve(harvardResp);
                }
                if (u.includes('metmuseum') && u.includes('search')) {
                    return Promise.resolve(metSearchResp);
                }
                    return Promise.resolve({ data: {} });
            });
        //const getSpy = jest.spyOn(axios, 'get')
        //.mockResolvedValueOnce({ data: {records: [{ id: 1, title: 'Painting Art', classification: 'Painting' }, { id: 2, title: 'Sculpture Art', classification: 'Sculpture' }] } })
        
        //.mockResolvedValueOnce({ data: { objectIDs: [] } });
        
        render(<SearchComponent />);
        
        await userEvent.click(screen.getByRole('button', { name: /search/i }));

        expect(await screen.findByText('Painting Art')).toBeInTheDocument();
        expect(await screen.findByText('Sculpture Art')).toBeInTheDocument();

        const filterSelect = screen.getByLabelText(/Filter By Classification/i);
        await userEvent.selectOptions(filterSelect, 'Paintings');

        await userEvent.click(screen.getByRole('button', { name: /search/i }));
        //expect(await screen.findByText('Painting Art')).toBeInTheDocument();

        await waitFor(() => {
        expect(screen.queryByText('Sculpture Art')).not.toBeInTheDocument();
        
        });
        expect(getSpy).toHaveBeenCalled();

    });

    
    });
