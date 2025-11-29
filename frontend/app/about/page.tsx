export default function AboutPage() {
	return (
		<div className="container mx-auto px-6 py-12">
			<h1 className="text-3xl font-bold">About ShopMart</h1>
			<p className="muted mt-4">ShopMart is a demo shopping storefront built for demonstrations and hackathons. It showcases a secure backend, product listing, cart and a smooth checkout experience.</p>
			<div className="mt-6">
				<a href="/products" className="btn btn-primary">Browse products</a>
			</div>
		</div>
	);
}
