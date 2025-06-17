# Spotify Playlist Generator

This is a simple web application that allows users to generate a custom Spotify playlist based on artist names they provide.

## Features

- Spotify OAuth 2.0 for user authentication.
- Search for artists and retrieve their top tracks.
- Create a new playlist on the user's Spotify account with the collected tracks.

## Setup and Installation

1.  **Clone the repository (if applicable):**

    ```bash
    git clone <repository_url>
    cd spotplaylist
    ```

2.  **Create a Spotify Developer Application:**

    a.  Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
    b.  Log in with your Spotify account.
    c.  Click on "Create an App".
    d.  Fill in the App Name and App Description. Agree to the terms and conditions.
    e.  Once the app is created, you will see your **Client ID** and **Client Secret**.
    f.  Click on "Edit Settings".
    g.e.  Under "Redirect URIs", add `https://spotplaylist.netlify.app/callback`. This is crucial for the OAuth flow to work correctly during development.

3.  **Update `script.js`:**

    Open the `script.js` file located in the project root.
    Replace `YOUR_CLIENT_ID` with the Client ID you obtained from the Spotify Developer Dashboard.

    ```javascript
    const CLIENT_ID = 'YOUR_CLIENT_ID'; // Replace with your Spotify Client ID
    const REDIRECT_URI = 'https://spotplaylist.netlify.app/callback'; // Must match your Spotify app settings
    ```

4.  **Run the Application:**

    You can serve these files using any simple web server. For example, if you have Python installed, you can run:

    ```bash
    python -m http.server 3000
    ```

    Or, if you have Node.js, you can install `serve` globally:

    ```bash
    npm install -g serve
    serve -p 3000 .
    ```

    Then, open your web browser and navigate to `http://localhost:3000`.

## Usage

1.  Click the "Login with Spotify" button to authenticate with your Spotify account.
2.  After successful login, enter the names of artists (comma-separated) in the "Enter artist names" field.
3.  Optionally, provide a "Playlist Name" and "Playlist Description". If left blank, a default name and description will be generated.
4.  Click "Generate Playlist" to create a new playlist on your Spotify account containing top tracks from the specified artists.

## Project Structure

```
spotplaylist/
├── index.html
├── style.css
├── script.js
└── README.md
```