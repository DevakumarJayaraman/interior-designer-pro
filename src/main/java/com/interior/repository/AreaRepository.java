package com.interior.repository;

import com.interior.model.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AreaRepository extends JpaRepository<Area, Long> {
  List<Area> findByProject_Id(Long projectId);
}
