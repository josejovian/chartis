import {
  ButtonDropdownSelect,
  EventCard,
  LayoutCard,
  LayoutNotice,
  TemplateSearchInput,
} from "@/components";
import {
  EventSearchType,
  EventSortNameType,
  EventTagNameType,
  EventType,
  ScreenSizeCategoryType,
} from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useIdentification, useToast, useEventsObject } from "@/hooks";
import { getEvents, getFollowedEvents, validateEventQuery } from "@/utils";
import {
  ASSET_CALENDAR,
  ASSET_NO_CONTENT,
  EVENT_QUERY_LENGTH_CONSTRAINTS,
  EVENT_SORT_CRITERIA,
  EVENT_TAGS,
} from "@/consts";
import { where } from "firebase/firestore";
import { useRouter } from "next/router";

export interface PageSearchEventCardProps {
  noWrapper?: boolean;
  viewType?: EventSearchType;
  className?: string;
  userId?: string;
  type: ScreenSizeCategoryType;
}

export function PageSearchEventCard({
  noWrapper,
  viewType,
  className,
  userId,
  type,
}: PageSearchEventCardProps) {
  const {
    eventsArray,
    setEventsObjectFromArray,
    updateClientSideEvent,
    // deleteClientSideEvent,
    stateSubscribedIds,
    updateUserSubscribedEventClientSide,
  } = useEventsObject();
  const subscribedIds = stateSubscribedIds[0];
  const stateFilters = useState<EventTagNameType[]>([]);
  const [filters, setFilters] = stateFilters;
  const stateQuery = useState("");
  const [query, setQuery] = stateQuery;
  const stateSort = useState<EventSortNameType>("newest");
  const [sort, setSort] = stateSort;
  const { addToastPreset } = useToast();
  const sortBy = useMemo(() => EVENT_SORT_CRITERIA[sort], [sort]);
  const router = useRouter();
  const { stateIdentification } = useIdentification();
  const [identification] = stateIdentification;
  const { user } = identification;
  const authorId =
    router.pathname === "/event/created" ? user?.id : router.query.id;
  const queried = useRef(0);

  const checkForSubscribed = useCallback(
    (id: string) => Boolean(typeof subscribedIds[id] === "number"),
    [subscribedIds]
  );

  const sortEvents = useCallback(
    (eventsArray: EventType[]): EventType[] => {
      const { key, descending } = sortBy;
      let eventArray = [] as EventType[];
      const isDescending = descending ? 1 : -1;
      eventArray = eventsArray.sort((a, b) => {
        const left = a[key] ?? 0;
        const right = b[key] ?? 0;
        if (
          (typeof left === "number" && typeof right === "number") ||
          (typeof left === "string" && typeof right === "string")
        )
          if (left > right) {
            return -1 * isDescending;
          }
        if (right > left) {
          return 1 * isDescending;
        }
        return 0;
      });

      return eventArray;
    },
    [sortBy]
  );

  const displayedEvents = useMemo(() => {
    let queriedEvents: EventType[] = [];

    console.log(eventsArray);

    if (queried && query.length > 3) {
      queriedEvents.push(
        ...eventsArray.filter((event) =>
          event.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else if (viewType !== "default" && query.length < 4) {
      queriedEvents.push(...eventsArray);
    }

    if (viewType === "userFollowedEvents")
      queriedEvents = queriedEvents.filter((event) =>
        Object.keys(subscribedIds).includes(event.id)
      );

    if (viewType === "userCreatedEvents") {
      queriedEvents = queriedEvents.filter(
        (event) => userId === event.authorId
      );
    }

    const filteredEvents = queriedEvents.filter((event) => {
      const eventTags = Object.keys(event.tags);
      return filters.every((filter) => eventTags.includes(filter));
    });

    const sortedEvents = sortEvents(filteredEvents);

    return sortedEvents;
  }, [eventsArray, filters, query, sortEvents, subscribedIds, viewType]);

  const handleUpdatePathQueries = useCallback(() => {
    if (queried.current <= 1) return;

    sessionStorage.setItem(
      viewType ?? "default",
      JSON.stringify({
        filters,
        query,
        sort,
      })
    );
  }, [filters, query, sort, viewType]);

  const handleGetPathQuery = useCallback(() => {
    const rawQuery = sessionStorage.getItem(viewType ?? "default");

    if (rawQuery && queried.current <= 1) {
      const parsedQuery = JSON.parse(rawQuery);

      const parsedFilters = parsedQuery.filters;

      setFilters(parsedFilters);
      setQuery(parsedQuery.query);
      setSort(parsedQuery.sort);
    }

    queried.current++;
  }, [setFilters, setQuery, setSort, viewType]);

  useEffect(() => {
    handleUpdatePathQueries();
  }, [handleUpdatePathQueries]);

  useEffect(() => {
    handleGetPathQuery();
  }, [handleGetPathQuery]);

  useEffect(() => {
    switch (viewType) {
      case "userCreatedEvents":
        console.log(userId);
        userId &&
          getEvents([where("authorId", "==", userId)])
            .then((event) => setEventsObjectFromArray(event))
            .catch((e) => {
              addToastPreset("fail-get");
            });
        break;
      case "userFollowedEvents":
        user
          ? user.id &&
            getFollowedEvents(user.id)
              .then((events) => {
                setEventsObjectFromArray(
                  events.filter((event) => event !== undefined) as EventType[]
                );
              })
              .catch(() => {
                addToastPreset("fail-get");
              })
          : Object.keys(subscribedIds).length > 0 &&
            getEvents([]).then((eventsArray) =>
              setEventsObjectFromArray(
                eventsArray.filter(
                  (event) => typeof subscribedIds[event.id] !== "undefined"
                )
              )
            );
        break;
      case "default":
        getEvents([]).then((eventsArray) =>
          setEventsObjectFromArray(eventsArray)
        );
        break;
    }
  }, [
    addToastPreset,
    authorId,
    setEventsObjectFromArray,
    subscribedIds,
    user,
    userId,
    viewType,
  ]);

  const filterCaption = useMemo(
    () => (
      <>
        &nbsp;that has the tag(s): <b>{filters.join(", ")}</b>
      </>
    ),
    [filters]
  );

  const sortCaption = useMemo(
    () => ` , sorted by ${sortBy.name}.`,
    [sortBy.name]
  );

  const renderCaption = useMemo(
    () => (
      <>
        {!validateEventQuery(query) &&
          `Search query must be ${EVENT_QUERY_LENGTH_CONSTRAINTS[0] + 1}-${
            EVENT_QUERY_LENGTH_CONSTRAINTS[1]
          } characters. `}
        {query !== "" ? (
          <>
            Searching for {query}
            {filters.length > 0 && filterCaption}
          </>
        ) : (
          <>
            Filtering by{" "}
            <b>{filters.length > 0 ? filters.join(", ") : "none"}</b>
          </>
        )}
        {sortCaption}
      </>
    ),
    [filterCaption, filters, query, sortCaption]
  );

  const renderEvents = useMemo(
    () =>
      displayedEvents.map((event) => (
        <EventCard
          key={`PageSearchEventCard_${event.id}`}
          type={type === "mobile" ? "vertical" : "horizontal"}
          event={event}
          updateUserSubscribedEventClientSide={
            updateUserSubscribedEventClientSide
          }
          updateClientSideEvent={updateClientSideEvent}
          subscribed={checkForSubscribed(event.id)}
        />
      )),
    [
      checkForSubscribed,
      displayedEvents,
      type,
      updateClientSideEvent,
      updateUserSubscribedEventClientSide,
    ]
  );

  const renderEmpty = useMemo(
    () => (
      <LayoutNotice
        illustration={query !== "" ? ASSET_NO_CONTENT : ASSET_CALENDAR}
        title={query !== "" ? "No Events" : "Start Searching"}
        description={
          query !== ""
            ? "No eventsArray found with such query."
            : "Select a filter or type in any key word."
        }
      />
    ),
    [query]
  );

  const renderContents = useMemo(
    () => (displayedEvents.length > 0 ? renderEvents : renderEmpty),
    [displayedEvents.length, renderEmpty, renderEvents]
  );

  return (
    <LayoutCard className={className}>
      <div
        className={clsx(
          "flex gap-4",
          !noWrapper && "pl-4",
          type === "mobile" ? "flex-col" : "flex-row"
        )}
      >
        <TemplateSearchInput
          placeholder="Search eventsArray..."
          stateQuery={stateQuery}
        />
        <div className="flex grow-0 gap-4 justify-end">
          <ButtonDropdownSelect
            name="Filter"
            stateActive={stateFilters}
            options={EVENT_TAGS}
            size={type === "mobile" ? "tiny" : undefined}
            type="multiple"
          />
          <ButtonDropdownSelect
            name="Sort"
            stateActive={stateSort}
            options={EVENT_SORT_CRITERIA}
            size={type === "mobile" ? "tiny" : undefined}
            type="single"
          />
        </div>
      </div>
      <div className="mt-4 mb-6 pl-4">{renderCaption}</div>
      <div
        className={clsx(
          "flex flex-col gap-4",
          "pr-4 py-0.5 h-full overflow-y-auto",
          !noWrapper && "pl-4 mr-4"
        )}
      >
        {renderContents}
      </div>
    </LayoutCard>
  );
}
