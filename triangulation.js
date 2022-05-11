
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

	contains(vertex) {
		return this.a.equals(vertex) || this.b.equals(vertex);
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

	containsEdge(edge) {
		return this.e1.isSame(edge) || this.e2.isSame(edge) || this.e3.isSame(edge);
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

	remainingPoint(edge) {
		// given an edge of the triangle find remaining point
		if (!edge.contains(this.v1))
			return this.v1;
		if (!edge.contains(this.v2))
			return this.v2;
		if (!edge.contains(this.v3))
			return this.v3;
		
	}
}


class Triangulation {
	constructor(startingNodes) {
		this.triangles = [];
	  // lexicographically sort the vectors list
	  this.vectors = lexicoSort(startingNodes);
	  // TODO: probs need to remove duplicates (if they exist pretty unlikely)
	  this.convexHullTriangulation();
	}

	convexHullTriangulation() {
		// follows https://www2.cs.arizona.edu/classes/cs437/fall11/Lecture8.pdf
		// O(nlogn) convex hull triangulation algorithm

		// find convex hull
		let hull = [];

		hull.push(this.vectors[0]); // lexico sort comes in handy

		let current = this.vectors[0];
		let next = this.vectors[1];
		let nextIndex = 1;
		while(!current.equals(next)) {
			for (let i = 0; i < this.vectors.length; i++) {
				if (!this.vectors[i].equals(current)) {
					let v1 = p5.Vector.sub(next, current);
					let v2 = p5.Vector.sub(this.vectors[i], current);

					if (v1.cross(v2).z < 0) {
						next = this.vectors[i];
						nextIndex = i;
					}
				}
			}
			hull.push(next);
			current = next;
			this.vectors.splice(nextIndex, 1);
			next = this.vectors[0];
		}
		// take starting node off
		this.vectors.shift();

		this.drawHull(hull);

		// hull is done, time for triangulation

		// all remaining points are inside the hull
		// start triangles with random point, this case next up point
		let startingPoint = this.vectors.shift();
		for (var i = 0; i < hull.length - 1; i++) {
			this.triangles.push(new Triangle(hull[i], hull[i+1], startingPoint));
		}

		for (var i = this.vectors.length-1; i >= 0; i--) {
			// find triangle that contains this.vectors[i]
			let j = 0;
			let found = false;

			let point = this.vectors.pop();
			while(j < this.triangles.length && !found) {
				let result = this.pointInTriangle(point, this.triangles[j]);
				// console.log(result);
				if (result.w1 >= -0.0001 && result.w2 >= -0.0001 && (result.w1 + result.w2) <= 1.0001) {
					// inside triangle!
					found = true;
					// assuming no duplicate points
					if ((result.w1 >= -0.0001 && result.w1 <= 0.0001) || 
							(result.w2 >= -0.0001 && result.w2 <= 0.0001) || 
							(result.w1 + result.w2 >= 0.9999 && result.w1 + result.w2 <= 1.0001)) {
						// Edge case time:
						console.log("EDGE CASE TIME", result.w1, result.w2, result.w1 + result.w2);
						let touchingTrianglesIndexes = [];
						if (result.w1 >= -0.0001 && result.w1 <= 0.0001) {
							console.log("A-C");
							// on edge a-c or I think: v1-v3
							touchingTrianglesIndexes = this.findTrianglesWithEdge(this.triangles[j].e3);
						} else if (result.w2 >= -0.0001 && result.w2 <= 0.0001) {
							console.log("A-B");
							// on edge a-b or v1-v2
							touchingTrianglesIndexes = this.findTrianglesWithEdge(this.triangles[j].e1);
						} else {
							console.log("B-C");
							// on edge b-c or v2-v3
							touchingTrianglesIndexes = this.findTrianglesWithEdge(this.triangles[j].e2);
						}

						if (touchingTrianglesIndexes.length == 1) {
							// co-linear points on the outside of the hull (shouldn't be possible I don't think)
							console.log("EDGE CASE LENGTH 1", this.triangles[touchingTrianglesIndexes[0]]);
						} else if (touchingTrianglesIndexes.length == 2) {
							let triangle1 = this.triangles[touchingTrianglesIndexes[0]];
							let triangle2 = this.triangles[touchingTrianglesIndexes[1]];
							
							// find 4 points plus new point
							let sharedEdge = triangle1.sharesEdge(triangle2);
							let a = triangle1.remainingPoint(sharedEdge);
							let b = sharedEdge.a;
							let c = sharedEdge.b;
							let d = triangle2.remainingPoint(sharedEdge);
							console.log(this.triangles[touchingTrianglesIndexes[0]], this.triangles[touchingTrianglesIndexes[1]], a, b, c, d, point);
							// remove old triangles (indexes are found consecutively so removing them back to front)							
							this.triangles.splice(touchingTrianglesIndexes[1], 1);
							this.triangles.splice(touchingTrianglesIndexes[0], 1);

							// connect the dots making 4 triangles
							this.triangles.push(new Triangle(a, b, point));
							this.triangles.push(new Triangle(a, c, point));
							this.triangles.push(new Triangle(b, d, point));
							this.triangles.push(new Triangle(c, d, point));
						} else {
							console.log("LENGTH OF EDGE CASE IS MORE THAN 2", touchingTrianglesIndexes);
						}
					} else {
						// generic inside triangle
						// console.log("INSIDE TRIANGLE");
						let a = this.triangles[j].v1;
						let b = this.triangles[j].v2;
						let c = this.triangles[j].v3;

						// remove triangle
						this.triangles.splice(j, 1);
						this.triangles.push(new Triangle(a, b, point));
						this.triangles.push(new Triangle(a, c, point));
						this.triangles.push(new Triangle(b, c, point));
					}
				} else {
					j++;
				}
			}
		}
		// triangulation complete
		console.log("LEFT OVER", this.vectors);
	}

	// from fantastic video and code example https://github.com/SebLague/Gamedev-Maths/blob/master/PointInTriangle.cs
	pointInTriangle(point, triangle) {
		let s1 = triangle.v3.y - triangle.v1.y;
		let s2 = triangle.v3.x - triangle.v1.x;
		let s3 = triangle.v2.y - triangle.v1.y;
		let s4 = point.y - triangle.v1.y;

		let s5 = triangle.v2.x - triangle.v1.x;
		// numerator and denominator
		let num = triangle.v1.x * s1 + s4 * s2 - point.x * s1;
		let den = s3 * s2 - s5 * s1;

		let w1 = num / den;
		let w2 = (s4 - w1 * s3) / s1; 

		// return w1, and w2 values
		return {w1, w2};
	}

	findTrianglesWithEdge(edge) {
		// return all triangles that share an edge
		let sharingTrianglesIndexes = [];
		for (let i = 0; i < this.triangles.length; i++) {
			if (this.triangles[i].containsEdge(edge)) {
				sharingTrianglesIndexes.push(i);
			}
		}

		return sharingTrianglesIndexes;
	}

	drawHull(hull) {
		for (let i = 0; i < hull.length - 1; i++) {
			line(hull[i].x, hull[i].y, hull[i+1].x, hull[i+1].y);
		}
		line(hull[hull.length-1].x, hull[hull.length-1].y, hull[0].x, hull[0].y);
	}
	drawTriangulation() {
		for (var i = 0; i < this.triangles.length; i++) {
			this.triangles[i].drawTriangle();
		}

		// let sharedEdge = this.triangles[0].sharesEdge(this.triangles[1]);
		// console.log("Shares edge?", sharedEdge);

		// this.checkDelaunay(this.triangles[0], this.triangles[1], sharedEdge);
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
