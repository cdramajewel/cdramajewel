import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import Modal from '../components/Modal';
import AddContentForm from '../components/AddContentForm';
import Spinner from '../components/Spinner';
import type { Content } from '../types';

const AdminDashboard: React.FC = () => {
  const { content, addContent, updateContent, deleteContent, loading } = useContent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddNew = () => {
    setSelectedContent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Content) => {
    setSelectedContent(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteContent(id);
    }
  };

  const handleSave = (data: Content) => {
    if (selectedContent) {
      updateContent(data);
    } else {
      addContent(data);
    }
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleAddNew}
          className="bg-brand-purple hover:bg-brand-purple-light text-white font-bold py-2 px-4 rounded-md transition"
        >
          Add New Content
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-brand-purple focus:border-brand-purple block p-2.5"
        />
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">Poster</th>
              <th scope="col" className="px-6 py-3">Title</th>
              <th scope="col" className="px-6 py-3">Type</th>
              <th scope="col" className="px-6 py-3">Year</th>
              <th scope="col" className="px-6 py-3">Episodes</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContent.map(item => (
              <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <img src={item.posterUrl} alt={item.title} className="h-16 w-12 object-cover rounded" />
                </td>
                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                  {item.title}
                </th>
                <td className="px-6 py-4">{item.type}</td>
                <td className="px-6 py-4">{item.releaseYear}</td>
                <td className="px-6 py-4">{item.episodes?.length ?? (item.type === 'Movie' ? 1 : 0)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => handleEdit(item)} 
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition text-xs font-semibold"
                        aria-label={`Edit ${item.title}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                        <span>Edit</span>
                    </button>
                    <button 
                        onClick={() => handleDelete(item.id, item.title)} 
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md transition text-xs font-semibold"
                        aria-label={`Delete ${item.title}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                        <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredContent.length === 0 && (
          <p className="text-center py-8 text-gray-500">No content found.</p>
        )}
      </div>

      {isModalOpen && (
        <Modal
          title={selectedContent ? 'Edit Content' : 'Add New Content'}
          onClose={() => setIsModalOpen(false)}
        >
          <AddContentForm
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
            initialData={selectedContent}
          />
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;