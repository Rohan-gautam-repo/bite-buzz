export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">
          🍔 Bite-Buzz
        </h1>
        <p className="text-2xl text-muted-foreground mb-8">
          Your favorite food, delivered fast!
        </p>
        <div className="flex gap-4 justify-center">
          <div className="text-4xl">🍕</div>
          <div className="text-4xl">🍜</div>
          <div className="text-4xl">🍰</div>
          <div className="text-4xl">🥗</div>
          <div className="text-4xl">🍱</div>
        </div>
      </div>
    </div>
  );
}
