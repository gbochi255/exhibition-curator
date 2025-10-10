
import React from 'react';
import  { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import SearchComponent from '../components/SearchComponent';
import ExhibitionView from '../components/ExhibitionView';
import { ToastContainer } from 'react-toastify';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function delayedResolve<T>(payload: T, ms = 20): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(payload), ms));
}

describe('SearchComponent + ExhibitionView integration tests', () => {

const HARVARD_BASE = 'api.harvardartmuseums.org/object';
const MET_SEARCH= 'collectionapi.metmuseum.org/public/collection/v1/search';
const MET_OBJECTS ='collectionapi.metmuseum.org/public/collection/v1/objects/';

    
    function setUpAxiosMockForSearch() {
        mockedAxios.get.mockImplementation((arg: string | AxiosRequestConfig) => {
            const url = typeof arg === 'string' ? arg : (arg?.url ?? '') 
            if(url.includes('harvardartmuseums') || url.includes('api.harvardartmuseums.org')) {
                return delayedResolve({
                    data: {
                        records: [
                            { id: 1, title: 'Painting Art', classification: 'Painting', primaryimageurl: 'p.jpg', description: 'paint'},
                            { id: 2, title: 'Sculpture Art', classification: 'Sculpture', primaryimageurl: 's.jpg', description: 'sculpt'}
                        ]
                    }
                }, 20) as unknown as Promise<any>;
            }
            if(url.includes('collectionapi.metmeseum.org/public/collection/v1/search') && url.includes('/search')) {
                return delayedResolve({ data: { objectIDs: [] } }, 10) as unknown as Promise<any>;
            }
            if(url.includes('/objects')) {
                return delayedResolve({ data: { objectID: 999, title: `Met Test`, primaryImage:`met.jpg`,
                        
                    }
                    
                }, 10) as unknown as Promise<any>;
            }
            return delayedResolve({ data: {} }, 5) as unknown as Promise<any>;
            
        });
    }
        beforeEach(() => {
        jest.resetAllMocks();
        //jest.clearAllMocks();
        localStorage.clear();
    });
            

            
    test('renders SearchComponent UI', () => {
        render(<SearchComponent />);
        expect(screen.getByText('Search Artworks')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter keyword (e.g, Mona Lisa)')).toBeInTheDocument();
        expect(screen.getByText('Renaissance')).toBeInTheDocument();
    });
    test('shows loading spinner during search (test id)', async () => {
        setUpAxiosMockForSearch();
        render(
            <>
            <ToastContainer />
            <SearchComponent />
            </>
        );
        const input = screen.getByPlaceholderText('Enter keyword (e.g, Mona Lisa)');
        await userEvent.type(input, 'test query');
        expect(screen.queryByTestId('search-spinner')).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /search/i }));

        const spinner = await screen.findByTestId('search-spinner', {}, { timeout: 1000 });
        expect(spinner).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId('search-spinner')).not.toBeInTheDocument();
            //expect(getSpy).toHaveBeenCalled();
        }, { timeout: 3000 });
    });
    test('fetches and displays artworks on search and supports filtering', async () => {
        setUpAxiosMockForSearch();
        render(
            <>
            <ToastContainer />
            <SearchComponent />
            </>
            );
        const input = screen.getByPlaceholderText('Enter keyword (e.g, Mona Lisa)')
        await userEvent.type(input, 'flowers');
        await userEvent.click(screen.getByRole('button', { name: /search/i }));

        const items = await screen.findAllByRole('listitem',  {}, { timeout: 3000 });
        expect(items.length).toBeGreaterThanOrEqual(2);
        
        expect(screen.getByText('Painting Art')).toBeInTheDocument();
        expect(screen.getByText('Sculpture Art')).toBeInTheDocument();

        const filterSelect = screen.getByLabelText('Filter By Classification:');
        await userEvent.selectOptions(filterSelect, 'Painting');

        await waitFor(() => {
            expect(screen.getByText('Painting Art')).toBeInTheDocument();
            expect(screen.queryByText('Sculpture Art')).not.toBeInTheDocument();
        }, { timeout: 1500});
    });

    test('sort results by date ascending', async () => {
        mockedAxios.get.mockImplementation((arg: string | AxiosRequestConfig) => {
            const url = typeof arg === 'string' ? arg : (arg?.url ??  '');
            if(url.includes("harvardartmuseums") || url.includes('api.harvardartmuseums.org')) {
                return Promise.resolve({
                    data: {
                        records: [
                            { id: 1, title: 'Old Art', dated: '1800', primaryimageurl: 'o.jpg' },
                            { id: 2, title: 'New Art', dated: '2000', primaryimageurl: 'n.jpg'}
                        ]
                    }
                });
            }
            if(url.includes('collectionapi.metmuseum.org/public/collection/v1/search')) {
                return Promise.resolve({ data: { objectIDs: [] } });
            }
            return Promise.resolve({ data: {} });
        });
        
        render(<SearchComponent />);
        const input = screen.getByPlaceholderText('Enter keyword (e.g, Mona Lisa)')
        await userEvent.type(input, 'dates');
        await userEvent.click(screen.getByRole('button', { name: /search/i }));

        const items = await screen.findAllByRole('listitem', {}, { timeout: 3000 });
        expect(items.length).toBeGreaterThanOrEqual(2);
        //expect(items[0].textContent).toContain('Old Art');

        const sortSelect = screen.getByLabelText('Sort By:');
        await userEvent.selectOptions(sortSelect, 'dateAsc');

        const sortedItems = await screen.findAllByRole('listitem', {}, { timeout: 3000 });
        const firstText = sortedItems[0].textContent ?? '';
        expect(firstText).toContain('Old Art');
    });

    test('ExhibitionView loads from localstorage and create share link', async () => {
        const sample = [{ id: 'x1', title: 'Sample Art', imageUrl: undefined }];
        localStorage.setItem('exhibition', JSON.stringify(sample));

        render(
            <MemoryRouter>
                <ExhibitionView />
            </MemoryRouter>
        );
        expect(screen.getByText('My exhibition(1 item)')).toBeInTheDocument();
        expect(screen.getByText('Sample Art')).toBeInTheDocument();

        const writeSpy =jest.spyOn((navigator as any).clipboard, 'writeText').mockResolvedValue(undefined);
        const button = screen.getByText('Copy Share Link');
        await userEvent.click(button);

        expect(writeSpy).toHaveBeenCalled();
        writeSpy.mockRestore();
    });
    test('ExhibitionView loads from URL param if provided', () => {
        const sample = [{ id: 'u1', title: 'FormURL' }];
        const encoded = btoa(JSON.stringify(sample));

        render(
            <MemoryRouter initialEntries={[`/exhibition?items=${encoded}`]}>
                <ExhibitionView />
            </MemoryRouter>
        );
        expect(screen.getByText('FormURL')).toBeInTheDocument();
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
                    return delayedResolve(harvardResp, 20) as any;
                }
                if (u.includes('metmuseum') && u.includes('search')) {
                    return delayedResolve(metSearchResp, 20) as any;
                }
                    return delayedResolve({ data: {} }, 20)as any; });
        
        render(<SearchComponent />);

        const input = screen.getByPlaceholderText('Enter keyword (e.g, Mona Lisa)');
        await userEvent.type(input, 'flowers');
        
        await userEvent.click(screen.getByRole('button', { name: /search/i }));

        expect(await screen.findByText('Painting Art')).toBeInTheDocument();
        expect(await screen.findByText('Sculpture Art')).toBeInTheDocument();

        const filterSelect = screen.getByLabelText(/Filter By Classification/i);
        await userEvent.selectOptions(filterSelect, 'Painting');

        await userEvent.click(screen.getByRole('button', { name: /search/i }));
        

        await waitFor(() => {
            expect(screen.getByText('Painting Art')).toBeInTheDocument();
        expect(screen.queryByText('Sculpture Art')).not.toBeInTheDocument();
        }, { timeout: 1500 });
        expect(getSpy).toHaveBeenCalled();

    });
    
    
    });
