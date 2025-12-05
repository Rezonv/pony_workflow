import fetch from 'node-fetch';

const ENDPOINT_ID = "r1jygm0t3ubrw6";
const API_KEY = process.env.RUNPOD_API_KEY;

async function listModels() {
    const runUrl = `https://api.runpod.ai/v2/${ENDPOINT_ID}/run`;

    console.log(`Triggering model list via error at ${runUrl}...`);

    // We use a fake LORA name to force ComfyUI to list available options
    const workflow = {
        "3": {
            "inputs": {
                "seed": 1,
                "steps": 1,
                "cfg": 1,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1,
                "model": ["10", 0], // Connect to LoRA
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
        "10": {
            "inputs": {
                "lora_name": "NON_EXISTENT_LORA_TO_TRIGGER_LIST.safetensors",
                "strength_model": 1,
                "strength_clip": 1,
                "model": ["4", 0],
                "clip": ["4", 1]
            },
            "class_type": "LoraLoader"
        },
        "5": {
            "inputs": { "width": 512, "height": 512, "batch_size": 1 },
            "class_type": "EmptyLatentImage"
        },
        "6": {
            "inputs": { "text": "test", "clip": ["10", 1] }, // Connect to LoRA CLIP
            "class_type": "CLIPTextEncode"
        },
        "7": {
            "inputs": { "text": "test", "clip": ["10", 1] }, // Connect to LoRA CLIP
            "class_type": "CLIPTextEncode"
        },
        "8": {
            "inputs": { "samples": ["3", 0], "vae": ["4", 2] },
            "class_type": "VAEDecode"
        },
        "9": {
            "inputs": { "images": ["8", 0], "filename_prefix": "test" },
            "class_type": "SaveImage"
        }
    };

    try {
        const response = await fetch(runUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({ input: { workflow: workflow } })
        });

        const text = await response.text();
        console.log("Raw Response:", text);

        try {
            const data = JSON.parse(text);
            if (data.id) {
                console.log(`Job ${data.id} started. Polling for error...`);
                await pollForError(data.id);
            }
        } catch (e) {
            console.error("Failed to parse JSON response:", e);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

async function pollForError(jobId) {
    const statusUrl = `https://api.runpod.ai/v2/${ENDPOINT_ID}/status/${jobId}`;

    for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const res = await fetch(statusUrl, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        const data = await res.json();
        console.log(`Status: ${data.status}`);

        if (data.status === 'FAILED') {
            console.log("Job Failed (Expected). Error Output:");
            console.log(JSON.stringify(data, null, 2));
            break;
        }
        if (data.status === 'COMPLETED') {
            console.log("Job Completed (Unexpected? Model might exist?)");
            break;
        }
    }
}

listModels();
