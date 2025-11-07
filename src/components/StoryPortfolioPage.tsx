import { useState, useEffect } from 'react';
import PortfolioShowcase from './portafolio-showcase';
import StoryDetailModal from './StoryDetailModal';
import CreateStoryModal from './CreateStoryModal';
import { portfolioDataService, PortfolioStoryData } from '../services/portfolioDataService';
import { Plus } from 'lucide-react';

interface StoryPortfolioPageProps {
  isActive?: boolean;
}

export default function StoryPortfolioPage({ isActive = false }: StoryPortfolioPageProps) {
  const [stories, setStories] = useState<PortfolioStoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const portfolioStories = await portfolioDataService.getShowcaseStories();
      setStories(portfolioStories);
      console.log('📚 Loaded stories for portfolio:', portfolioStories.length);
    } catch (error) {
      console.error('Error loading portfolio stories:', error);
      // Use demo data as fallback
      const demoStories = portfolioDataService.getDemoPortfolioData();
      setStories(demoStories);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (storyId: string) => {
    console.log('🎬 Opening story details for:', storyId);
    setSelectedStoryId(storyId);
    setModalOpen(true);
  };

  const handleStoryDelete = (storyId: string) => {
    console.log('🗑️ Story deleted:', storyId);
    // Remove from local state
    setStories(prev => prev.filter(story => story.storyId !== storyId));
    // Close modal
    setModalOpen(false);
    setSelectedStoryId(null);
  };

  const handlePortfolioDelete = async (storyId: string) => {
    console.log('🗑️ Deleting story from portfolio:', storyId);
    try {
      const result = await portfolioDataService.deleteStory(storyId);
      if (result.success) {
        // Remove from local state
        setStories(prev => prev.filter(story => story.storyId !== storyId));
        console.log('✅ Story deleted successfully');
      } else {
        console.error('❌ Failed to delete story:', result.error);
        alert(`Failed to delete story: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error deleting story:', error);
      alert('An error occurred while deleting the story');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedStoryId(null);
  };

  const handleCreateStory = () => {
    setCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
  };

  const handleStoryCreated = () => {
    // Reload stories to show the new one
    loadStories();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Create Story Button - Fixed Position with Beautiful Gradient - Only show when active */}
      {isActive && (
        <button
          onClick={handleCreateStory}
          className="z-50 group relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-cyan-500/25"
          style={{ 
            position: 'fixed',
            top: '80px',
            right: '24px',
            left: 'auto',
            transform: 'none'
          }}
          title="Create New Story"
        >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 group-hover:from-cyan-400 group-hover:via-blue-500 group-hover:to-purple-500 transition-all duration-300"></div>
        
        {/* Animated Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        
        {/* Button Content */}
        <div className="relative p-4 flex items-center justify-center">
          <Plus className="w-7 h-7 text-white drop-shadow-lg" />
        </div>
        
        {/* Subtle Border Glow */}
        <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-white/40 transition-all duration-300"></div>
      </button>
      )}

      {/* Portfolio Showcase */}
      <PortfolioShowcase 
        slides={stories} 
        onStoryClick={handleStoryClick}
        onStoryDelete={handlePortfolioDelete}
        canDelete={true}
        isActive={isActive}
      />
      
      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={createModalOpen}
        onClose={handleCreateModalClose}
        onStoryCreated={handleStoryCreated}
      />
      
      {/* Story Detail Modal */}
      {selectedStoryId && (
        <StoryDetailModal
          storyId={selectedStoryId}
          isOpen={modalOpen}
          onClose={handleModalClose}
          onDelete={handleStoryDelete}
        />
      )}
      
      {/* Story Count Indicator */}
      {stories.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2">
            <div className="text-white text-sm">
              <span className="font-medium">{stories.length}</span> {stories.length === 1 ? 'Story' : 'Stories'}
            </div>
            <div className="text-gray-400 text-xs">
              Click any story to view details
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {stories.length === 0 && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-30">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold text-white mb-3">No Stories Yet</h2>
            <p className="text-gray-400 mb-6">
              Create your first AI-powered story to see it showcased here with professional visuals and detailed breakdowns.
            </p>
            <button 
              onClick={handleCreateStory}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Story
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
