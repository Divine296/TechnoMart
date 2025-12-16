import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle, Image as ImageIcon } from 'lucide-react';

const CateringMenuSelection = ({
  categories,
  activeCategory,
  setActiveCategory,
  searchTerm,
  setSearchTerm,
  onAddToOrder,
  eventName,
  attendees,
}) => {
  // Search across all categories when there's a search term
  const getFilteredItems = () => {
    if (searchTerm.trim()) {
      const allItems = [];
      categories
        .filter((category) => category.id !== 'all')
        .forEach((category) => {
          category.items
            .filter(
              (item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
            )
            .forEach((item) => {
              allItems.push({ ...item, categoryName: category.name });
            });
        });
      return allItems;
    }
    return [];
  };

  const searchResults = getFilteredItems();

  const ItemListRow = ({ item, showCategoryBadge = false }) => {
    const imageSrc = item.image || item.imageUrl || null;
    const categoryLabel = item.categoryName || item.category || '';
    const isUnavailable = item.available === false;

    const handleActivate = (event) => {
      if (isUnavailable) return;
      if (event?.type === 'keydown') {
        event.preventDefault();
      }
      onAddToOrder(item);
    };

    return (
      <div
        role="button"
        tabIndex={isUnavailable ? -1 : 0}
        onClick={handleActivate}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            handleActivate(event);
          }
        }}
        className={`group flex items-center gap-4 p-3 border rounded-lg transition-all duration-200 ${
          isUnavailable
            ? 'cursor-not-allowed opacity-60 bg-muted/30'
            : 'cursor-pointer hover:bg-accent/50 hover:shadow-md hover:border-primary/20 active:scale-[0.99]'
        }`}
        aria-disabled={isUnavailable}
      >
        {/* Image Thumbnail */}
        <div className="shrink-0">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={item.name}
              className="h-16 w-16 rounded-md object-cover border border-border/50"
              loading="lazy"
            />
          ) : (
            <div className="h-16 w-16 rounded-md bg-muted/50 border border-border/50 flex items-center justify-center">
              <ImageIcon
                className="h-6 w-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-base leading-tight line-clamp-1">
              {item.name}
            </h4>
            <Badge
              variant={isUnavailable ? 'destructive' : 'outline'}
              className={`shrink-0 text-[10px] font-medium ${
                isUnavailable
                  ? ''
                  : 'bg-[#CDECC7] text-[#1E5B36] border-transparent'
              }`}
            >
              {isUnavailable ? 'Unavailable' : 'Available'}
            </Badge>
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {item.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">PHP</span>
              <span className="text-lg font-bold text-primary">
                {Number(item.price).toFixed(2)}
              </span>
            </div>

            {showCategoryBadge && categoryLabel && (
              <Badge
                variant="outline"
                className="text-[10px] bg-[#FFF3BF] text-[#5C4300] border-transparent"
              >
                {categoryLabel}
              </Badge>
            )}
          </div>
        </div>

        {/* Hover Indicator */}
        {!isUnavailable && (
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-xl font-bold">+</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="pb-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Menu Selection</h3>
            <p className="text-sm text-muted-foreground">
              {eventName} - {attendees} attendees
            </p>
          </div>
          <Badge variant="outline">Catering</Badge>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search menu items..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {searchTerm.trim() ? (
          // Search results view
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-1">
                Search results for "{searchTerm}"
              </h3>
              <div className="space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <ItemListRow
                      key={`${item.categoryName}-${item.id}`}
                      item={item}
                      showCategoryBadge
                    />
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <AlertCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      No menu items found matching "{searchTerm}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Category tabs view
          <Tabs
            defaultValue={categories[0]?.id}
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="flex-1 flex flex-col"
          >
            <div className="border-b">
              <TabsList className="w-full justify-start overflow-auto p-0 h-auto">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {categories.map((category) => {
              const categoryItems = Array.isArray(category.items)
                ? category.items
                : [];
              const showBadge = category.id === 'all' || category.id === 'All';
              return (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="flex-1 overflow-y-auto scrollbar-hide mt-0 p-2 space-y-2"
                >
                  {categoryItems.length > 0 ? (
                    categoryItems.map((item) => (
                      <ItemListRow
                        key={item.id}
                        item={item}
                        showCategoryBadge={showBadge}
                      />
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <AlertCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        No items in this category
                      </p>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default CateringMenuSelection;
