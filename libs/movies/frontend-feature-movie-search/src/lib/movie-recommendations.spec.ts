import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieRecommendations } from './movie-recommendations';

describe('MovieRecommendations', () => {
  let component: MovieRecommendations;
  let fixture: ComponentFixture<MovieRecommendations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieRecommendations],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieRecommendations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
