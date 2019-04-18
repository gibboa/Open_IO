describe("Start", function() {
	describe("ServerRuns", function() {
		
		  // Matchers
		beforeEach(function () {
			this.addMatchers(imagediff.jasmine);
		});
		it("ServerOpens", function(done) {
			expect(200).toBe(200);
			done();
		
		});
		
	});
	
});