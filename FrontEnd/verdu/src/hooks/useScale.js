import { useState, useEffect, useRef } from 'react';
import ConfigService from '../services/config.service';

export const useScale = (pos_id) => {
    const [weight, setWeight] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);

    // Connect WebSocket when pos_id is available
    useEffect(() => {
        if (!pos_id) return;

        const connect = () => {
            if (ws.current?.readyState === WebSocket.OPEN) return;

            setConnectionStatus('connecting');
            console.log(`Connecting to scale ${pos_id}...`);

            const wsUrl = ConfigService.getWebSocketUrl(`ws/scale/${pos_id}/`);
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log('Scale WS Connected (Waiting for agent status...)');
                // Connection open doesn't mean Scale Agent is online yet.
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'status_check' || data.type === 'status_update') {
                        setIsConnected(data.active);
                        setConnectionStatus(data.active ? 'connected' : 'disconnected');
                    }

                    if (data.weight !== undefined) {
                        setWeight(parseFloat(data.weight));
                        // If we are receiving weight, force connected state
                        if (!isConnected) {
                            setIsConnected(true);
                            setConnectionStatus('connected');
                        }
                    }
                } catch (e) {
                    console.error("Scale data parse error", e);
                }
            };

            ws.current.onclose = () => {
                console.log('Scale Disconnected');
                setConnectionStatus('disconnected');
                setIsConnected(false);
                // Reconnect logic
                setTimeout(() => {
                    if (pos_id) connect();
                }, 3000);
            };

            ws.current.onerror = (error) => {
                console.error('Scale WebSocket Error:', error);
                setConnectionStatus('error');
                ws.current.close();
            };
        };

        connect();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [pos_id]);

    return { weight, connectionStatus, isConnected };
};
