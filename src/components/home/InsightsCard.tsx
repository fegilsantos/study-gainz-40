
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSuggestions } from '@/hooks/useSuggestions';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const InsightsCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations'>('insights');
  const { suggestions, loading, error } = useSuggestions();

  // Filter suggestions by type (strengths = insights, opportunities = recommendations)
  const insights = suggestions.filter(suggestion => suggestion.type === 'strengths');
  const recommendations = suggestions.filter(suggestion => suggestion.type === 'opportunities');

  const renderSuggestions = (items: typeof suggestions, emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return items.map((suggestion, index) => (
      <div key={index} className="space-y-1 mb-4">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <h3 className="font-medium">{suggestion.title}</h3>
            {suggestion.subtitle && (
              <p className="text-sm text-muted-foreground">{suggestion.subtitle}</p>
            )}
          </div>
          {suggestion.subject && (
            <Badge variant="outline" className="shrink-0 bg-primary/10">
              {suggestion.subject}
            </Badge>
          )}
        </div>
        {suggestion.content && (
          <p className="text-sm">{suggestion.content}</p>
        )}
      </div>
    ));
  };

  // Loading state
  if (loading) {
    return (
      <Card className="col-span-1 h-full">
        <CardHeader>
          <CardTitle className="text-base">Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="col-span-1 h-full">
        <CardHeader>
          <CardTitle className="text-base">Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <p>Não foi possível carregar os dados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {activeTab === 'insights' ? 'Insights' : 'Recomendações'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="insights" 
          className="space-y-4"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'insights' | 'recommendations')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          </TabsList>
          <TabsContent value="insights" className="space-y-2">
            {renderSuggestions(insights, "Nenhum insight disponível no momento.")}
          </TabsContent>
          <TabsContent value="recommendations" className="space-y-2">
            {renderSuggestions(recommendations, "Nenhuma recomendação disponível no momento.")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
