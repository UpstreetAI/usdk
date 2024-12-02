import WebSocket from 'ws';
import { serverConfig } from './config';

const SAMPLE_RATE = 16000;
const serverConfig = {
    host: 'xxxxx',
    controlPort: 8011,
    dataPort: 8012,
};

class RealtimeSTT {
    constructor() {
        this.controlSocket = null;
        this.dataSocket = null;
        this.recordingStream = null;
        this.sampleRate = SAMPLE_RATE;
    
        // create the WebSocket URLs from config
        this.controlUrl = `ws://${serverConfig.host}:${serverConfig.controlPort}`;
        this.dataUrl = `ws://${serverConfig.host}:${serverConfig.dataPort}`;
    }

    async start() {
        console.log('Connecting to RealtimeSTT server...');
        
        // Connect to control socket using config
        this.controlSocket = new WebSocket(this.controlUrl);
        this.controlSocket.on('open', () => {
            console.log('Control socket connected to:', this.controlUrl);
            
            // Send all configuration parameters
            const configs = [
                {
                    command: "set_parameter",
                    parameter: "language",
                    value: "en"
                },
            ];

            // Send each configuration command
            configs.forEach(config => {
                this.controlSocket.send(JSON.stringify(config));
                console.log(`Configured ${config.parameter}: ${config.value}`);
            });
        });

        this.controlSocket.on('message', (data) => {
            console.log('Control message:', data.toString());
        });

        // Connect to data socket using config
        this.dataSocket = new WebSocket(this.dataUrl);
        this.dataSocket.on('open', () => {
            console.log('Data socket connected to:', this.dataUrl);
        });

        this.dataSocket.on('message', (data) => {
            try {
                const result = JSON.parse(data.toString());
                if (result.type === 'realtime') {
                    process.stdout.write(`\rPartial: ${result.text}`);
                } else if (result.type === 'fullSentence') {
                    console.log(`\nFinal: ${result.text}\n`);
                }
            } catch (err) {
                console.log('Raw message:', data.toString());
            }
        });

        // Wait for both connections
        await Promise.all([
            new Promise(resolve => this.controlSocket.once('open', resolve)),
            new Promise(resolve => this.dataSocket.once('open', resolve))
        ]);

        console.log('Ready to receive streaming data...');

        // Function to handle incoming streaming data
        this.handleIncomingData = (chunk) => {
            if (this.dataSocket.readyState === WebSocket.OPEN) {
                // Prepare metadata as in Python client
                const metadata = {
                    sampleRate: this.sampleRate,
                    channels: 1,
                    encoding: 'PCM16'
                };
                const metadataStr = JSON.stringify(metadata);
                const metadataLength = Buffer.alloc(4);
                metadataLength.writeUInt32LE(metadataStr.length);
                
                // Combine metadata and audio data
                const message = Buffer.concat([
                    metadataLength,
                    Buffer.from(metadataStr),
                    chunk
                ]);
                
                this.dataSocket.send(message);
            }
        };

        console.log('\nListening for incoming data... (Press Ctrl+C to stop)\n');
    }

    stop() {
        if (this.recordingStream) {
            this.recordingStream.destroy();
        }
        if (this.controlSocket) {
            this.controlSocket.close();
        }
        if (this.dataSocket) {
            this.dataSocket.close();
        }
        console.log('\nStopped recording and closed connections');
    }
}

export default RealtimeSTT;

// // Start the test
// const testClient = new RealtimeSTT();

// // Handle graceful shutdown
// process.on('SIGINT', () => {
//     console.log('\nShutting down...');
//     testClient.stop();
//     process.exit(0);
// });

// // Start the test
// testClient.start().catch(err => {
//     console.error('Error:', err);
//     process.exit(1);
// });