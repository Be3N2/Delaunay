
// bubble sort vectors
function lexicoSort(list) {
  let swap;
  for (let i = 0; i < list.length; i++) {
    let smallest = i;
    for (let j = i + 1; j < list.length; j++) {
      if (list[j].x < list[smallest].x) {
        smallest = j;
      } else if (list[j].x == list[smallest].x) {
        if (list[j].y < list[smallest].y) {
          smallest = j;
        }
      }
    }
    // swap smallest and move to next
    swap = list[i];
    list[i] = list[smallest];
    list[smallest] = swap;
  }

  return list;
}

class Edge {
	constructor(a, b) {
		this.a = a;
		this.b = b;
	}

	isSame(edge2) {
		return (this.a == edge2.a && this.b == edge2.b) || 
			(this.a == edge2.b && this.b == edge2.a);
	}

	getLength() {
		console.log(this.a.x, this.b.x, this.a.y, this.b.y);
		return Math.sqrt(Math.pow(this.a.x - this.b.x, 2) + Math.pow(this.a.y - this.b.y, 2));
	}
}


class Triangle {
	constructor(a, b, c) {
		// vertexes a, b, c
		this.v1 = a;
		this.v2 = b;
		this.v3 = c;

		this.e1 = new Edge(a, b);
		this.e2 = new Edge(b, c);
		this.e3 = new Edge(a, c);

		this.centerV = createVector((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3);	
	}

	sharesEdge(triangle2) {
		// compare all edges, return the shared edge or false
		// dum compare, because Im dum
		if (this.e1.isSame(triangle2.e1)) return this.e1;
		if (this.e1.isSame(triangle2.e2)) return this.e1;
		if (this.e1.isSame(triangle2.e3)) return this.e1;
		if (this.e2.isSame(triangle2.e1)) return this.e2;
		if (this.e2.isSame(triangle2.e2)) return this.e2;
		if (this.e2.isSame(triangle2.e3)) return this.e2;
		if (this.e3.isSame(triangle2.e1)) return this.e3;
		if (this.e3.isSame(triangle2.e2)) return this.e3;
		if (this.e3.isSame(triangle2.e3)) return this.e3;

		return false;
	}

	drawTriangle() {
    let absPoint = 4 * (this.centerV.x + (this.centerV.y * imgWidth));
		fill(lenna.pixels[absPoint], lenna.pixels[absPoint + 1], lenna.pixels[absPoint + 2]);
    triangle(this.v1.x, this.v1.y, this.v2.x, this.v2.y, this.v3.x, this.v3.y);
	}

	getDelta(sharedEdge) {
		// first formula of law of cosines https://en.wikipedia.org/wiki/Law_of_cosines
		let a, b, c;

		// make sure c is the length of the shared edge
		if (this.e1.isSame(sharedEdge)) {
			c = this.e1.getLength();
			a = this.e2.getLength();
			b = this.e3.getLength();
		} else if (this.e2.isSame(sharedEdge)) {
			c = this.e2.getLength();
			a = this.e1.getLength();
			b = this.e3.getLength();
		} else {
			c = this.e3.getLength();
			a = this.e1.getLength();
			b = this.e2.getLength();
		}

		console.log("TEST", a, b, c);
		// formula time
		return Math.acos(((a * a) + (b * b) - (c * c))/ (2 * a * b)) * 180 / Math.PI;
	}
}


class Triangulation {
	constructor(startingNodes) {
		this.triangles = [];
	  // lexicographically sort the vectors list
	  this.vectors = lexicoSort(startingNodes);
	  this.buildBasicTriangluation();
	}

	buildBasicTriangluation() {
		for (var i = 0; i < this.vectors.length - 2; i++) {
			this.triangles.push(new Triangle(this.vectors[i], this.vectors[i + 1], this.vectors[i + 2]));
		}
	}

	drawTriangulation() {
		for (var i = 0; i < this.triangles.length; i++) {
			this.triangles[i].drawTriangle();
		}

		let sharedEdge = this.triangles[0].sharesEdge(this.triangles[1]);
		console.log("Shares edge?", sharedEdge);

		this.checkDelaunay(this.triangles[0], this.triangles[1], sharedEdge);
	}

	checkDelaunay(triangle1, triangle2, sharedEdge) {
		// check if delaunay condition is met
		// if the angles at the non shared points are less than 180

		// find both delta's given shared edge
		let delta1 = triangle1.getDelta(sharedEdge);
		let delta2 = triangle2.getDelta(sharedEdge);

		console.log("DELTAS:", delta1, delta2, delta1+delta2)
		if (delta1 + delta2 < 180) {
			console.log("DELAUNAY");
		} else {
			console.log("NEEDS FLIPPED");
		}

	}
}
