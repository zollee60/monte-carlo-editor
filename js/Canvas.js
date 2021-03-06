export default class Canvas {

    constructor(id) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext("2d");
        this.numOfAll = [];
        this.numOfIn = [];
        this.width = 0;
        this.height = 0;
        this.size = 0;
        this.pi = [];
        this.charts = [];
        this.closestValues = 0;
        this.startingImgData = null;
    }

    drawCircleQuadrant() {
        let r = this.canvas.width;
        this.ctx.strokeStyle = 'rgb(255,0,0)';
        this.ctx.fillStyle = 'rgb(255,0,0)';
        this.ctx.beginPath();
        this.ctx.arc(0, canvas.height, r, 1.5 * Math.PI, 0);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, 0);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.fill();
        this.startingImgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    checkIfIsInside(i, x, y) {
        
        const red = y * (this.canvas.width * 4) + x * 4;
        const indices = [
            red,
            red + 1,
            red + 2,
            red + 3
        ];

        if (this.startingImgData.data[indices[0]] === 255 && this.startingImgData.data[indices[1]] === 0 && this.startingImgData.data[indices[2]] === 0) {
            this.numOfIn[i]++;
        }
        //console.log(`checkIfIsInside() is called numOfIn: ${this.numOfIn[i]} numOfAll: ${this.numOfAll[i]}`);
    }

    calcAreaApprox(i,W,H){
        //console.log((this.numOfIn[i] / this.numOfAll[i]) * (W * H));
        return (this.numOfIn[i] / this.numOfAll[i]) * (W * H);
    }

    calcPiApprox(i) {
        return 4 * (this.numOfIn[i] * Math.pow(this.size, 2) / this.numOfAll[i]) / Math.pow(this.size, 2);
    }

    genRandomNonRedColor() {
        let red = Math.floor(Math.random() * Math.floor(100));
        let blue = Math.floor(Math.random() * Math.floor(255));
        let green = Math.floor(Math.random() * Math.floor(255));

        return `rgb(${red}, ${green}, ${blue})`;
    }

    getClosestPIApprox(arr) {
        return arr.reduce((prev, curr) => {
            return (Math.abs(curr.y - Math.PI) < Math.abs(prev.y - Math.PI) ? curr : prev)
        });
    }

    getClosestAreaApprox(arr,A) {
        return arr.reduce((prev, curr) => {
            return (Math.abs(curr.y - A) < Math.abs(prev.y - A) ? curr : prev)
        });
    }



    genNewRandom(D, N, W, H, A, s) {
        const ws = W/s;
        const hs = H/s;
        this.width = W;
        this.height = H;
        //this.size = S;
        this.pi = [];
        this.numOfAll = Array.from({length: D},() => 0);
        this.numOfIn = Array.from({length: D},() => 0);
        let colorstrings = Array.from({length: D}, () => this.genRandomNonRedColor());
        for (let i = 0; i < N; i++) {
            let tmpPI = [];
            for (let j = 0; j < D; j++) {
                this.ctx.fillStyle = colorstrings[j];
                let rx = Math.floor(Math.random() * Math.floor(this.canvas.width));
                let ry = Math.floor(Math.random() * Math.floor(this.canvas.height));

                this.numOfAll[j]++;
                this.checkIfIsInside(j, rx, ry);
                let approx = A === 1 ? this.calcAreaApprox(j,W/s,H/s) : this.calcPiApprox(j);
                tmpPI.push(approx);
                //console.log(approx);
                this.ctx.fillRect(rx - 1, ry - 1, 2, 2);
            }
            let sum = tmpPI.reduce((x,y) => x+y,0);
            //console.log(sum);
            this.pi.push({x: i, y: sum / tmpPI.length});
        }

        this.fire(this.pi, this.genRandomNonRedColor(), `W = ${W}, H = ${H}, P = ${N}, N = ${D}`);
        this.closestValues = A === 1 ? this.getClosestAreaApprox(this.pi).y : this.getClosestPIApprox(this.pi).y;

    }

    resetCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.pi = [];
        this.numOfAll = [];
        this.numOfIn = [];
        this.charts = [];
        this.closestValues = 0;
    }

    subscribe(chart) {
        this.charts.push(chart);
    }

    fire(da, cs, l) {
        this.charts.forEach(c => c.addNewDataSet(da, cs, l));
    }
}
