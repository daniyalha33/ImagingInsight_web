// src/components/web/teacher/LiveClassRoom.tsx
//
// SETUP INSTRUCTIONS:
// 1. npm install agora-rtc-sdk-ng
// 2. Add to your .env:  VITE_AGORA_APP_ID=your_app_id_here
// 3. Use this component inside TeacherDashboard or TeacherClassDetail
//
// USAGE:
//   <LiveClassRoom classId="abc123" teacherName="Dr. Smith" token={authToken} onClose={() => {}} />

import { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import type {
  IAgoraRTCClient,
  ILocalVideoTrack,
  ILocalAudioTrack,
  IAgoraRTCRemoteUser,
  ScreenVideoTrackInitConfig,
} from 'agora-rtc-sdk-ng';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || 'ede37016b96944caa4e84bf9d60d2307';

interface LiveClassRoomProps {
  classId: string;
  teacherName: string;
  token: string; // Your JWT auth token
  onClose: () => void;
}

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

export function LiveClassRoom({ classId, teacherName, token, onClose }: LiveClassRoomProps) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Format seconds to MM:SS
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Fetch Agora token from your backend
  const fetchAgoraToken = async (channelName: string): Promise<{ token: string; uid: number }> => {
    const res = await fetch(`${API_BASE}/live/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channelName, uid: 0 }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to get token');
    return { token: data.token, uid: data.uid };
  };

  const startClass = useCallback(async () => {
    try {
      setConnectionState('connecting');
      setErrorMsg('');

      const channelName = `class_${classId}`;

      // Notify backend to emit socket event to students
      await fetch(`${API_BASE}/live/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ classId }),
      });

      // Get Agora token
      const { token: agoraToken, uid } = await fetchAgoraToken(channelName);

      // Create Agora client
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      // Set as host (teacher)
      await client.setClientRole('host');

      // Listen for remote users
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        setRemoteUsers(prev => {
          if (prev.find(u => u.uid === user.uid)) return prev;
          return [...prev, user];
        });
        setParticipantCount(client.remoteUsers.length + 1);
      });

      client.on('user-unpublished', (user) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        setParticipantCount(client.remoteUsers.length + 1);
      });

      client.on('user-left', (user) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        setParticipantCount(client.remoteUsers.length + 1);
      });

      // Join channel
      await client.join(AGORA_APP_ID, channelName, agoraToken, uid);

      // Create camera + mic tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

      // Play local video
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      // Publish tracks
      await client.publish([audioTrack, videoTrack]);

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);
      setConnectionState('connected');
      setParticipantCount(1);

      // Start duration timer
      durationRef.current = setInterval(() => setDuration(d => d + 1), 1000);

    } catch (err: any) {
      console.error('Failed to start class:', err);
      setConnectionState('error');
      setErrorMsg(err.message || 'Failed to start live class');
    }
  }, [classId, token]);

  const toggleCamera = async () => {
    if (!localVideoTrack) return;
    await localVideoTrack.setEnabled(!isCameraOn);
    setIsCameraOn(prev => !prev);
  };

  const toggleMic = async () => {
    if (!localAudioTrack) return;
    await localAudioTrack.setEnabled(!isMicOn);
    setIsMicOn(prev => !prev);
  };

  const toggleScreenShare = async () => {
    const client = clientRef.current;
    if (!client) return;

    try {
      if (!isScreenSharing) {
        const config: ScreenVideoTrackInitConfig = { encoderConfig: '1080p_1' };
        const track = await AgoraRTC.createScreenVideoTrack(config, 'disable') as ILocalVideoTrack;

        // Unpublish camera, publish screen
        if (localVideoTrack) await client.unpublish(localVideoTrack);
        await client.publish(track);

        // Show screen in local preview
        if (localVideoRef.current) {
          localVideoTrack?.stop();
          track.play(localVideoRef.current);
        }

        // Handle user stopping screen share via browser UI
        track.on('track-ended', () => {
          stopScreenShare(track);
        });

        setScreenTrack(track);
        setIsScreenSharing(true);
      } else {
        stopScreenShare(screenTrack!);
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        console.error('Screen share error:', err);
      }
    }
  };

  const stopScreenShare = async (track: ILocalVideoTrack) => {
    const client = clientRef.current;
    if (!client) return;
    try {
      await client.unpublish(track);
      track.stop();
      track.close();

      // Republish camera
      if (localVideoTrack) {
        await localVideoTrack.setEnabled(true);
        await client.publish(localVideoTrack);
        if (localVideoRef.current) localVideoTrack.play(localVideoRef.current);
      }

      setScreenTrack(null);
      setIsScreenSharing(false);
    } catch (err) {
      console.error('Stop screen share error:', err);
    }
  };

  const endClass = useCallback(async () => {
    const client = clientRef.current;

    // Stop timer
    if (durationRef.current) clearInterval(durationRef.current);

    // Stop tracks
    localVideoTrack?.stop();
    localVideoTrack?.close();
    localAudioTrack?.stop();
    localAudioTrack?.close();
    screenTrack?.stop();
    screenTrack?.close();

    // Leave channel
    try {
      await client?.leave();
      await fetch(`${API_BASE}/live/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ classId }),
      });
    } catch (err) {
      console.error('Error ending class:', err);
    }

    setLocalVideoTrack(null);
    setLocalAudioTrack(null);
    setScreenTrack(null);
    setConnectionState('idle');
    clientRef.current = null;
    onClose();
  }, [localVideoTrack, localAudioTrack, screenTrack, classId, token, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionState === 'connected') endClass();
    };
  }, []);

  // ─── RENDER ────────────────────────────────────────────────────────────────

  if (connectionState === 'idle') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Start Live Class</h2>
          <p className="text-gray-500 text-sm mb-6">
            Students will be notified instantly when you go live. Make sure your camera and microphone are ready.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={startClass}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Go Live 🔴
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (connectionState === 'connecting') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Starting live class...</p>
          <p className="text-gray-400 text-sm mt-1">Setting up camera and microphone</p>
        </div>
      </div>
    );
  }

  if (connectionState === 'error') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Failed</h2>
          <p className="text-red-500 text-sm mb-6">{errorMsg}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium">
              Close
            </button>
            <button onClick={() => { setConnectionState('idle'); setErrorMsg(''); }} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── LIVE VIEW ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            LIVE
          </span>
          <span className="text-white font-semibold">{teacherName}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {participantCount}
          </span>
          <span className="font-mono">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Local video (teacher) */}
        <div ref={localVideoRef} className="w-full h-full bg-gray-900" />

        {/* Camera off overlay */}
        {!isCameraOn && !isScreenSharing && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl font-bold">
                {teacherName.charAt(0).toUpperCase()}
              </div>
              <p className="text-gray-400 text-sm">Camera is off</p>
            </div>
          </div>
        )}

        {/* Screen sharing badge */}
        {isScreenSharing && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Sharing Screen
          </div>
        )}

        {/* Remote users (students with camera on) */}
        {remoteUsers.length > 0 && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            {remoteUsers.slice(0, 4).map(user => (
              <div key={user.uid} id={`remote-${user.uid}`} className="w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border border-gray-700" />
            ))}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-5 flex items-center justify-center gap-4">
        
        {/* Mic */}
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMicOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          title={isMicOn ? 'Mute' : 'Unmute'}
        >
          {isMicOn ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        {/* Camera */}
        <button
          onClick={toggleCamera}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isCameraOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraOn ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>

        {/* End Call */}
        <button
          onClick={endClass}
          className="w-14 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors ml-4"
          title="End class"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}