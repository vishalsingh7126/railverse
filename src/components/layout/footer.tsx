export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-foreground/10 bg-transparent py-5">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-foreground/60">
          © {year} TravelCore Technologies Pvt. Ltd. All rights reserved.
        </p>
        <p className="mt-1 text-xs text-foreground/50">Railverse — A TravelCore Product</p>
      </div>
    </footer>
  );
}