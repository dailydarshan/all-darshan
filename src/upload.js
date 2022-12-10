const fs = require('fs');
const google = require('googleapis').google;
const youtube = google.youtube({ version: 'v3' })
const templeData = require('./data.json');
const OAuth2 = google.auth.OAuth2

const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID || '';
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || '';
const PORT = 5399;
const URI = `http://localhost:${PORT}`;
const REDIRECT_PATH = '/redirect'
const REDIRECT_URI = URI + REDIRECT_PATH;

async function upload(mandir, darshanDate) {

  await authenticateWithOAuth();
  const videoInformation = await uploadVideo(mandir, darshanDate)

  async function authenticateWithOAuth() {
    const OAuthClient = await createOAuthClient()
    OAuthClient.setCredentials({
      refresh_token: process.env.OAUTH_REFRESH_TOKEN || ''
    });
    setGlobalGoogleAuthentication(OAuthClient)
  }

  async function createOAuthClient() {
    const OAuthClient = new OAuth2(
      OAUTH_CLIENT_ID,
      OAUTH_CLIENT_SECRET,
      REDIRECT_URI
    )

    return OAuthClient
  }

  function setGlobalGoogleAuthentication(OAuthClient) {
    google.options({
      auth: OAuthClient
    })
  }



  async function uploadVideo(mandir, darshanDate) {
    const videoFilePath = `./${mandir}.mp4`
    const videoFileSize = fs.statSync(videoFilePath).size

    const temple = templeData ? (templeData[mandir] || []) : [];
    const videoTitle = temple.title ? temple.title.replace('{{DATE}}', darshanDate) : '';
    const videoTags = temple.tags || [];
    const videoDescription = temple.description ? temple.description.replace('{{DATE}}', darshanDate) : '';

    const requestParameters = {
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription,
          tags: videoTags
        },
        status: {
          privacyStatus: 'public',
          madeForKids: false,
          selfDeclaredMadeForKids: false
        }
      },
      media: {
        body: fs.createReadStream(videoFilePath)
      }
    }

    console.log('> [youtube-robot] Starting to upload the video to YouTube')
    const youtubeResponse = await youtube.videos.insert(requestParameters, {
      onUploadProgress: onUploadProgress
    })

    console.log(`> [youtube-robot] Video available at: https://youtu.be/${youtubeResponse.data.id}`)
    return youtubeResponse.data

    function onUploadProgress(event) {
      const progress = Math.round((event.bytesRead / videoFileSize) * 100)
      console.log(`> [youtube-robot] ${progress}% completed`)
    }

  }
}

module.exports = upload;
