// stdin
process.stdin.setEncoding("utf8");

process.stdin.on('readable', () => {
	var chunk = process.stdin.read();
	if (chunk !== null) {
		process.stdout.write(`data: ${chunk}`);
	}
});

process.stdin.on('end', () => {
	process.stdout.write('end');
});

console.log = (msg) => {
	process.stdout.write(`${msg}\n`);
};