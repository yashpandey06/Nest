import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import '@testing-library/jest-dom'
import { loadData } from '../../../src/lib/api'
import { ChaptersPage } from '../../../src/pages'
import { mockChapterData } from '../data/mockChapterData'

jest.mock('../../../src/lib/api', () => ({
  loadData: jest.fn(),
}))

jest.mock('../../../src/utils/credentials', () => ({
  API_URL: 'https://mock-api.com',
}))
jest.mock('../../../src/components/Pagination', () =>
  jest.fn(({ currentPage, onPageChange }) => (
    <div>
      <button onClick={() => onPageChange(currentPage + 1)}>Next Page</button>
    </div>
  ))
)

describe('ChaptersPage Component', () => {
  beforeEach(() => {
    ;(loadData as jest.Mock).mockResolvedValue(mockChapterData)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders loading spinner initially', async () => {
    render(<ChaptersPage />)
    const loadingSpinner = screen.getAllByAltText('Loading indicator')
    await waitFor(() => {
      expect(loadingSpinner.length).toBeGreaterThan(0)
    })
  })

  test('renders chapter data correctly', async () => {
    render(<ChaptersPage />)
    await waitFor(() => {
      expect(screen.getByText('Chapter 1')).toBeInTheDocument()
    })
    expect(screen.getByText('This is a summary of Chapter 1.')).toBeInTheDocument()
    expect(screen.getByText('Isanori Sakanashi,')).toBeInTheDocument()
    expect(screen.getByText('Takeshi Murai,')).toBeInTheDocument()
    expect(screen.getByText('Yukiharu Niwa')).toBeInTheDocument()
    const viewButton = screen.getByText('Join')
    expect(viewButton).toBeInTheDocument()
  })

  test('displays "No chapters found" when there are no chapters', async () => {
    ;(loadData as jest.Mock).mockResolvedValue({ ...mockChapterData, chapters: [], total_pages: 0 })
    render(<ChaptersPage />)
    await waitFor(() => {
      expect(screen.getByText('No chapters found')).toBeInTheDocument()
    })
  })

  test('handles page change correctly', async () => {
    window.scrollTo = jest.fn()
    render(<ChaptersPage />)
    await waitFor(() => {
      const nextPageButton = screen.getByText('Next Page')
      fireEvent.click(nextPageButton)
    })
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'auto',
    })
  })
})
