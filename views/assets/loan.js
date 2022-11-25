function Calculate() {
	const amount = document.getElementById("amount").value;
	const rate = document.getElementById("rate").value;
	const months = document.getElementById("months").value;

	const interest = (amount * (rate * 0.01)) / months;
		
	const total = ((amount / months) + interest).toFixed(2);

	document.getElementById("bal")
		.innerHTML = "EMI : ₹" + total;
}
