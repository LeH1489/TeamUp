interface EventsHeaderProps {
  eventName: string;
}

export const EventsHeader = ({ eventName }: EventsHeaderProps) => {
  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
      <p className="text-lg font-semibold"># {eventName}</p>
    </div>
  );
};
