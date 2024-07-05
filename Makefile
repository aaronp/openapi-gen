run:
	node gen.js
gen:
	scala-cli --power package --js Gen.scala -o gen.js