import "./Paragraph.css";

type ParagraphProps = {
  Paragraph?: string;
};

export const Paragraph: React.FC<ParagraphProps> = ({ Paragraph }) => {
  return (
    <div className="paragraph">
      {Paragraph ||
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis odit aliquid consectetur sint sed optio laudantium dicta dolor officia odio hic debitis eligendi totam iusto veniam repudiandae, id quam cum."}
    </div>
  );
};
