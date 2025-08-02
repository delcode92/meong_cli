import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

async function main() {
	let out = "";

	const stream = client.chatCompletionStream({
		provider: "hf-inference",
		model: "HuggingFaceTB/SmolLM3-3B",
		messages: 
        [
            {
              role: 'system',
              content: '/no_think'
            },
            { role: 'user', content: 'hello' },
            { role: 'assistant', content: 'Hello! How are you today?' },
            { role: 'user', content: 'hello' },
            { role: 'user', content: 'hallo' }
          ]
        
        // [
		// 	{ role: "system", content: "/no_think" },
		// 	{ role: "user", content: "What is the capital of France?" },
		// ],
	});

	for await (const chunk of stream) {
		if (chunk.choices && chunk.choices.length > 0) {
			const newContent = chunk.choices[0].delta.content;
			out += newContent;
			console.log(newContent);
		}
	}
}

main();
