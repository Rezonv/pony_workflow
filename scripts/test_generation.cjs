const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Read API Key from .env.local
let apiKey = "";
try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/RUNPOD_API_KEY=(.+)/);
    if (match) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error("Could not read .env.local:", e.message);
    process.exit(1);
}

if (!apiKey) {
    console.error("RUNPOD_API_KEY not found in .env.local");
    process.exit(1);
}

// 2. Configuration
const ENDPOINT_ID = "oaoz89pkudyfbn"; // Serverless Endpoint
const LORA_FILENAME = "lora_439481.safetensors";
const PROMPT = "score_9, score_8_up, score_7_up, score_6_up, source_anime, rating_explicit, 1girl, solo, looking at viewer, masterpiece, best quality, herta (honkai: star rail)";

// 3. RunPod Payload (ComfyUI Workflow)
const workflow = {
    "3": {
        "inputs": {
            "seed": Math.floor(Math.random() * 1000000000000000),
            "steps": 25,
            "cfg": 7.0,
            "sampler_name": "dpmpp_2m",
            "scheduler": "karras",
            "denoise": 1,
            "model": ["11", 0],
            "positive": ["6", 0],
            "negative": ["7", 0],
            "latent_image": ["5", 0]
        },
        "class_type": "KSampler"
    },
    "4": {
        "inputs": {
            "ckpt_name": "pony_v6_xl.safetensors"
        },
        "class_type": "CheckpointLoaderSimple"
    },
    "11": {
        "inputs": {
            "lora_name": LORA_FILENAME,
            "strength_model": 1.0,
            "strength_clip": 1.0,
            "model": ["4", 0],
            "clip": ["4", 1]
        },
        "class_type": "LoraLoader"
    },
    "5": {
        "inputs": {
            "width": 512,
            "height": 768,
            "batch_size": 1
        },
        "class_type": "EmptyLatentImage"
    },
    "10": {
        "inputs": {
            "stop_at_clip_layer": -2,
            "clip": ["11", 1]
        },
        "class_type": "CLIPSetLastLayer"
    },
    "6": {
        "inputs": {
            "text": PROMPT,
            "clip": ["10", 0]
        },
        "class_type": "CLIPTextEncode"
    },
    "7": {
        "inputs": {
            "text": "score_4, score_5, score_6, low quality, bad anatomy",
            "clip": ["10", 0]
        },
        "class_type": "CLIPTextEncode"
    },
    "8": {
        "inputs": {
            "samples": ["3", 0],
            "vae": ["4", 2]
        },
        "class_type": "VAEDecode"
    },
    "9": {
        "inputs": {
            "images": ["8", 0],
            "filename_prefix": "Test_Aglaea"
        },
        "class_type": "SaveImage"
    }
};

const payload = { input: { workflow: workflow } };

// 4. Helper to make requests
function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.runpod.ai',
            path: `/v2/${ENDPOINT_ID}/${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.log("Raw response:", data);
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// 5. Main Execution
async function run() {
    console.log(`Starting test generation on SERVERLESS: ${ENDPOINT_ID}...`);
    console.log(`Using LoRA: ${LORA_FILENAME}`);

    try {
        const runRes = await request('POST', 'run', payload);
        const jobId = runRes.id;
        console.log(`Job ID: ${jobId}`);

        let status = 'IN_QUEUE';
        while (status === 'IN_QUEUE' || status === 'IN_PROGRESS') {
            await new Promise(r => setTimeout(r, 2000));
            const statusRes = await request('GET', `status/${jobId}`);
            status = statusRes.status;
            console.log(`Status: ${status}`);

            if (status === 'COMPLETED') {
                console.log("SUCCESS! Image generated.");
                process.exit(0);
            }
            if (status === 'FAILED') {
                console.error("FAILED:", JSON.stringify(statusRes));
                process.exit(1);
            }
        }
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

run();
