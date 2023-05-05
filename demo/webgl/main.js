const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const startRecording = document.body.querySelector('#start');
const stopRecording = document.body.querySelector('#stop');
const recordingTime = document.body.querySelector('#recording-duration');

startRecording.addEventListener('click', () => {
    canvas.startRecording(200, { codec : 'avc1.420029',
        width: 0,
        height: 0,
        hardwareAcceleration:"prefer-hardware",
        avc:{format:"avc"}});
});

stopRecording.addEventListener('click', () => {
    canvas.stopRecording('myfile');
});


canvas.addEventListener('ready', () => {

    const gl = canvas.getContext('webgl');
    if (!gl) {
        alert('WebGL not supported in your browser');
    }

// Shader functions
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    function createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

// Get shaders and create program
    const vertexShaderSource = document.getElementById('vertexShader').text;
    const fragmentShaderSource = document.getElementById('fragmentShader').text;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

// Set up buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1.0, -1.0, 0.0, 0.0,
            1.0, -1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
        ]),
        gl.STATIC_DRAW
    );

// Set up attributes
    const a_position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 16, 0);

    const a_uv = gl.getAttribLocation(program, 'a_uv');
    gl.enableVertexAttribArray(a_uv);
    gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 16, 8);

// Set up uniforms
    const u_time = gl.getUniformLocation(program, 'u_time');

// Set up viewport and clear color
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);

// Render loop
    async function render(timestamp) {
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.uniform1f(u_time, timestamp / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        if (canvas.isRecording) {
            const duration = await canvas.encodeFrame();
            recordingTime.innerHTML = ` ${duration/1000000} seconds`;
        }
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

});