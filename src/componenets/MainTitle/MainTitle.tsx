import "./MainTitle.css";

type MainTitleProps = {
  MainTitle?: string;
};

export const MainTitle: React.FC<MainTitleProps> = ({ MainTitle }) => {
  return <h1 className="main-title">{MainTitle || "MomentuMatrix"}</h1>;
};
