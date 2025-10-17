# Exhibition Curator App 
 
 A viewer-driven virtual exhibition platform allowing users to search, filter, and curate personalised exhibitions from museum and university collections. Built as a freelance project using React, vite  with TypeScript, integrating free API's for artworks. This app meets the requirements for a minimum viable product(MVP) with extensions, responsive design, accessibility and documentation.  using museum API's.


 ## Project Overview
 **Context**: Developed for a coalition of museums and universities to create user-curated virtual exhibitions from combined catalogs, useful for researchers, students and art lovers.
 **High-level Outcome**: Users enter key terms or presets to fetch artworks, add to a personalised exhibition with images/info/links, navigate and share via unique links.
**MVP Achieved**:
 1. Search criteria to filter/sort artworks(keywords/presets, dropdowns for classification/date).
 2. Save to temporary collection(add/remove, view/expand with details).
 3. Display images/core info on interaction(thumbnails expand to full view).
 4. Session persistence(localStorage - survives refreshes, clear on browser close).
**Non-Functional Requirements Met**
 - Built in JavaScript/TypeScript(React TS)
- Responsive design(media queries, flexbox for mobile/desktop)
- Accessibility(alt texts, aria-labels, tested with wave - o errors)
- Fast media loading(lazy images, spinners/indicators)
- Hosted on free platform(netlify)
- Code documented(README.md)
**performance Criteria** Clear errors(toasts), loading(spinners), intuitive ui(buttons/labels for add/view)
**Tech Stack**: 
React, Vite, TypeScript, axios(API), React Router(navigation), react-spinners/toastify(UI feedback).
**Extensions implemented** Unique shareable links(URL params with base64 encoding).

## Setup and Installation(local run)
To run locally:
1. **Clone the Repo**:
git clone https://github.com/gbochi255/exhibition-curator.git
cd exhibition-curator

2. **Install Dependencies**:
npm install

3. **Get API key**(Harvard): Sign up at harvardartmuseums.org/developers(free) - add to code as HARVARD_API_KEY.
- Create a local env file(.env.local, do not commit). Put API keys in this file. add to .gitignore

4. **Run Dev Server**: - npm run dev
- open http://localhost:5173

5. **Build for production**: - npm run build
- Outputs to `dist` for hosting.
- npm run preview to preview it locally.
6. **Run Tests**:
  npm test - Covers render, search, filtering, sorting, error, add/remove, presets, loading, shareable link - All pass.

Major Commands Used:
- setup: `npm create vite@latest . -- --template react-ts`
- Deps: `npm install axios react-router-dom styled-components react-spinners react-toastify`
- Dev: `npm run dev`
- Test Setup: `npm install --save-dev jest ts-jest @type/jest @testing-library/react @testing/library/jest-dom @testing-library/user-event identity-obj-proxy ts-node`
- Git: `git init`, `git add .`, `git commit -m "message"`, `git push`

## Implementation Details
- Built a functional MVP with these key areas:
1. **Setup and Structure** (Week 1, Days 1 - 2):
- Vite + React TS boilerplate 
- Components: SearchComponent(search/filter/sort/UI), ExhibitionView(list/remove).
- Navigation: React Router for /search and /exhibition.
- Global CSS(index.css) for responsive layouts(media queries, Flexbox).

2. **API Integration(Week 1, Days 3 - 5)**:
- Harvard: `/object?q={query}&apikey={key}` for artworks.
- Met: `/search?q={query}` then /objects/{id} for details.
- Axios for fetches, combined results.

3. **Search/Filter/Sort UI(week 1, Days 6 - 7)**
- input/button for queries, presets buttons.
- Dropdowns for filter(classification) and sort(date asc/desc, classification).
- Results as list with thumbnails, details, "Add" button.

4. **Temporary Collection, (Week 2, days 8 - 11)**:
- State/localStorage for add/remove, persistence across refreshes.
- View with images/info/remove.

5. **Error/Loading Handling(week 2, days 12 - 14)**:
- Spinners for loading, toasts for error(react-spinners/toastify).
- Graceful no-results message.

6. **Responsive/Accessible Design(Week 2, days 13 - 14)**:
- Media queries for mobile(full-width buttons, centered content).
- Alt texts, aria-labels, keyboard nav.
- Tested with wave(0 errors), Lighthouse(performance 98, accessibility 100).

7. **Testing/QA (Week 3, days 15 - 17)**:
- Jest for unit/integration(render, search, error, add/remove, presets, loading - all pass).
- Manual UAT: Flows tested on desktop/mobile.
- Audits: Wave/Lighthouse confirmed.

8. **Extensions(Week 3, Days 18 - 19)**:
- Shareable links: Encode exhibition in URL(items=base64), decode on load, copy button.

9. **Deploy and Docs(week 3, Days 20 - 21)**
Deployed to netlify(free, auto update from GitHub)
- Create to Netlify and log in.
- Click New site -> Import from git
- Connect Git provider(GitHub) and choose the repo
- Set build command and publish directory
- Deploy site.
# Build & Publish settings
Build settings command - npm run build
Publish directory - dist
Netlify will run npm install, then run npm build.
## Required TypeScript compile first(tsc)  
In build script (locally) include
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test"; "jest"
  }
  ## Set or add environment variables in Netlify to Keep secrets like API keys 
  Add - key / value pair
  VITE_HARVARD_API_KEY:"your_api_key" - Netlify injects them to the build environment and Vite exposes them to the client as import.meta.env
  - this ensures not to expose secrets in the repo.
  # Client-side routing ior redirects
  add a _redirects file in public folder - ensures all client-side routes are served index.html
  /* /index.html 200

## Outcomes and Achievements
- **Functional MVP**: Fully achieved-users search/filter/sort, curate/view exhibitions with persistence.
- **Reliability**: Robust error/loading, secure (no auth needed for MVP).
- **Hosted**: 
- **Time Management**: To be Completed in 3 weeks
- **Learning**: Strengthened React/TS, API integration, testing skills






