export type NavItem = {
  displayStr: string;
  hrefStr: string;
};

export let arrForNav: NavItem[] = [
  {
    displayStr: "Home",
    hrefStr: "/",
  },
  {
    displayStr: "Strategy",
    hrefStr: "/strategy",
  },
  {
    displayStr: "Backtesting",
    hrefStr: "/backtesting",
  },
  {
    displayStr: "Performance",
    hrefStr: "/performance",
  },
  {
    displayStr: "Portfolio",
    hrefStr: "/portfolio",
  },
  {
    displayStr: "Transactions",
    hrefStr: "/transactions",
  },
  {
    displayStr: "About",
    hrefStr: "/about",
  },
];
